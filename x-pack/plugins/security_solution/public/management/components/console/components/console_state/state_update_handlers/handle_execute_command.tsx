/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

// FIXME:PT breakup module in order to avoid turning off eslint rule below
/* eslint-disable complexity */

import { i18n } from '@kbn/i18n';
import { v4 as uuidV4 } from 'uuid';
import React from 'react';
import { FormattedMessage } from '@kbn/i18n-react';
import { ConsoleCodeBlock } from '../../console_code_block';
import { handleInputAreaState } from './handle_input_area_state';
import { HelpCommandArgument } from '../../builtin_commands/help_command_argument';
import {
  CommandHistoryItem,
  ConsoleDataAction,
  ConsoleDataState,
  ConsoleStoreReducer,
} from '../types';
import { parseCommandInput, ParsedCommandInterface } from '../../../service/parsed_command_input';
import { UnknownCommand } from '../../unknown_comand';
import { BadArgument } from '../../bad_argument';
import { Command, CommandDefinition, CommandExecutionComponentProps } from '../../../types';

const toCliArgumentOption = (argName: string) => `--${argName}`;

const getRequiredArguments = (argDefinitions: CommandDefinition['args']): string[] => {
  if (!argDefinitions) {
    return [];
  }

  return Object.entries(argDefinitions)
    .filter(([_, argDef]) => argDef.required)
    .map(([argName]) => argName);
};

const getUnknownArguments = (
  inputArgs: ParsedCommandInterface['args'],
  argDefinitions: CommandDefinition['args'] | undefined
): string[] => {
  const response: string[] = [];

  Object.keys(inputArgs).forEach((argName) => {
    if (!argDefinitions || !argDefinitions[argName]) {
      response.push(argName);
    }
  });

  return response;
};

const getExclusiveOrArgs = (argDefinitions: CommandDefinition['args']): string[] => {
  if (!argDefinitions) {
    return [];
  }

  const exclusiveOrArgs: string[] = [];

  return Object.entries(argDefinitions).reduce((acc, [argName, argDef]) => {
    if (argDef.exclusiveOr) {
      acc.push(argName);
    }
    return acc;
  }, exclusiveOrArgs);
};

const updateStateWithNewCommandHistoryItem = (
  state: ConsoleDataState,
  newHistoryItem: ConsoleDataState['commandHistory'][number]
): ConsoleDataState => {
  const updatedState = handleInputAreaState(state, {
    type: 'updateInputHistoryState',
    payload: { command: newHistoryItem.command.input },
  });

  updatedState.commandHistory = [...state.commandHistory, newHistoryItem];

  return updatedState;
};

const UnknownCommandDefinition: CommandDefinition = {
  name: 'unknown-command',
  about: 'unknown command',
  RenderComponent: () => null,
};

const createCommandExecutionState = (
  store: CommandExecutionComponentProps['store'] = {}
): CommandHistoryItem['state'] => {
  return {
    status: 'pending',
    store,
  };
};

const cloneCommandDefinitionWithNewRenderComponent = (
  command: Command,
  RenderComponent: CommandDefinition['RenderComponent']
): Command => {
  return {
    ...command,
    commandDefinition: {
      ...command.commandDefinition,
      // We use the original command definition, but replace
      // the RenderComponent for this invocation
      RenderComponent,
    },
  };
};

const createCommandHistoryEntry = (
  command: CommandHistoryItem['command'],
  state: CommandHistoryItem['state'] = createCommandExecutionState()
): CommandHistoryItem => {
  return {
    id: uuidV4(),
    enteredAt: new Date().toISOString(),
    command,
    state,
  };
};

export const handleExecuteCommand: ConsoleStoreReducer<
  ConsoleDataAction & { type: 'executeCommand' }
> = (state, action) => {
  const parsedInput = parseCommandInput(action.payload.input);

  if (parsedInput.name === '') {
    return state;
  }

  const { commands } = state;
  const commandDefinition: CommandDefinition | undefined = commands.find(
    (definition) => definition.name === parsedInput.name
  );

  // Unknown command
  if (!commandDefinition) {
    return updateStateWithNewCommandHistoryItem(
      state,
      createCommandHistoryEntry({
        input: parsedInput.input,
        args: parsedInput,
        commandDefinition: {
          ...UnknownCommandDefinition,
          RenderComponent: UnknownCommand,
        },
      })
    );
  }

  const command = {
    input: parsedInput.input,
    args: parsedInput,
    commandDefinition,
  };
  const requiredArgs = getRequiredArguments(commandDefinition.args);
  const exclusiveOrArgs = getExclusiveOrArgs(commandDefinition.args);

  const exclusiveOrErrorMessage = (
    <FormattedMessage
      id="xpack.securitySolution.console.commandValidation.exlcusiveOr"
      defaultMessage="This command supports only one of the following arguments: {argNames}"
      values={{
        argNames: (
          <ConsoleCodeBlock>{exclusiveOrArgs.map(toCliArgumentOption).join(', ')}</ConsoleCodeBlock>
        ),
      }}
    />
  );

  // If args were entered, then validate them
  if (parsedInput.hasArgs) {
    // Show command help
    if (parsedInput.hasArg('help')) {
      return updateStateWithNewCommandHistoryItem(
        state,
        createCommandHistoryEntry(
          cloneCommandDefinitionWithNewRenderComponent(command, HelpCommandArgument)
        )
      );
    }

    // Command supports no arguments
    if (!commandDefinition.args || Object.keys(commandDefinition.args).length === 0) {
      return updateStateWithNewCommandHistoryItem(
        state,
        createCommandHistoryEntry(
          cloneCommandDefinitionWithNewRenderComponent(command, BadArgument),
          createCommandExecutionState({
            errorMessage: i18n.translate(
              'xpack.securitySolution.console.commandValidation.noArgumentsSupported',
              {
                defaultMessage: 'Command does not support any arguments',
              }
            ),
          })
        )
      );
    }

    // no unknown arguments allowed?
    const unknownInputArgs = getUnknownArguments(parsedInput.args, commandDefinition.args);

    if (unknownInputArgs.length) {
      return updateStateWithNewCommandHistoryItem(
        state,
        createCommandHistoryEntry(
          cloneCommandDefinitionWithNewRenderComponent(command, BadArgument),
          createCommandExecutionState({
            errorMessage: (
              <FormattedMessage
                id="xpack.securitySolution.console.commandValidation.unknownArgument"
                defaultMessage="The following {command} {countOfInvalidArgs, plural, =1 {argument is} other {arguments are}} not support by this command: {unknownArgs}"
                values={{
                  countOfInvalidArgs: unknownInputArgs.length,
                  command: (
                    <ConsoleCodeBlock transparentBackground={true}>
                      {parsedInput.name}
                    </ConsoleCodeBlock>
                  ),
                  unknownArgs: (
                    <ConsoleCodeBlock transparentBackground={true}>
                      {unknownInputArgs.map(toCliArgumentOption).join(', ')}
                    </ConsoleCodeBlock>
                  ),
                }}
              />
            ),
          })
        )
      );
    }

    // Missing required Arguments
    for (const requiredArg of requiredArgs) {
      if (!parsedInput.args[requiredArg]) {
        return updateStateWithNewCommandHistoryItem(
          state,

          createCommandHistoryEntry(
            cloneCommandDefinitionWithNewRenderComponent(command, BadArgument),
            createCommandExecutionState({
              errorMessage: i18n.translate(
                'xpack.securitySolution.console.commandValidation.missingRequiredArg',
                {
                  defaultMessage: 'Missing required argument: {argName}',
                  values: {
                    argName: toCliArgumentOption(requiredArg),
                  },
                }
              ),
            })
          )
        );
      }
    }

    // Validate exclusiveOr arguments, can only have one.
    const exclusiveArgsUsed = exclusiveOrArgs.filter((arg) => parsedInput.args[arg]);
    if (exclusiveArgsUsed.length > 1) {
      return updateStateWithNewCommandHistoryItem(
        state,
        createCommandHistoryEntry(
          cloneCommandDefinitionWithNewRenderComponent(command, BadArgument),
          createCommandExecutionState({
            errorMessage: exclusiveOrErrorMessage,
          })
        )
      );
    }

    // Validate each argument given to the command
    for (const argName of Object.keys(parsedInput.args)) {
      const argDefinition = commandDefinition.args[argName];
      const argInput = parsedInput.args[argName];

      // Unknown argument
      if (!argDefinition) {
        return updateStateWithNewCommandHistoryItem(
          state,
          createCommandHistoryEntry(
            cloneCommandDefinitionWithNewRenderComponent(command, BadArgument),

            createCommandExecutionState({
              errorMessage: i18n.translate(
                'xpack.securitySolution.console.commandValidation.unsupportedArg',
                {
                  defaultMessage: 'Unsupported argument: {argName}',
                  values: { argName: toCliArgumentOption(argName) },
                }
              ),
            })
          )
        );
      }

      // does not allow multiple values
      if (!argDefinition.allowMultiples && Array.isArray(argInput) && argInput.length > 1) {
        return updateStateWithNewCommandHistoryItem(
          state,
          createCommandHistoryEntry(
            cloneCommandDefinitionWithNewRenderComponent(command, BadArgument),
            createCommandExecutionState({
              errorMessage: i18n.translate(
                'xpack.securitySolution.console.commandValidation.argSupportedOnlyOnce',
                {
                  defaultMessage: 'Argument can only be used once: {argName}',
                  values: { argName: toCliArgumentOption(argName) },
                }
              ),
            })
          )
        );
      }

      if (argDefinition.validate) {
        const validationResult = argDefinition.validate(argInput);

        if (validationResult !== true) {
          return updateStateWithNewCommandHistoryItem(
            state,
            createCommandHistoryEntry(
              cloneCommandDefinitionWithNewRenderComponent(command, BadArgument),
              createCommandExecutionState({
                errorMessage: i18n.translate(
                  'xpack.securitySolution.console.commandValidation.invalidArgValue',
                  {
                    defaultMessage: 'Invalid argument value: {argName}. {error}',
                    values: { argName: toCliArgumentOption(argName), error: validationResult },
                  }
                ),
              })
            )
          );
        }
      }
    }
  } else if (requiredArgs.length > 0) {
    return updateStateWithNewCommandHistoryItem(
      state,
      createCommandHistoryEntry(
        cloneCommandDefinitionWithNewRenderComponent(command, BadArgument),
        createCommandExecutionState({
          errorMessage: i18n.translate(
            'xpack.securitySolution.console.commandValidation.mustHaveArgs',
            {
              defaultMessage: 'Missing required arguments: {requiredArgs}',
              values: {
                requiredArgs: requiredArgs
                  .map((argName) => toCliArgumentOption(argName))
                  .join(', '),
              },
            }
          ),
        })
      )
    );
  } else if (exclusiveOrArgs.length > 0) {
    return updateStateWithNewCommandHistoryItem(
      state,
      createCommandHistoryEntry(
        cloneCommandDefinitionWithNewRenderComponent(command, BadArgument),
        createCommandExecutionState({
          errorMessage: exclusiveOrErrorMessage,
        })
      )
    );
  } else if (commandDefinition.mustHaveArgs) {
    return updateStateWithNewCommandHistoryItem(
      state,
      createCommandHistoryEntry(
        cloneCommandDefinitionWithNewRenderComponent(command, BadArgument),
        createCommandExecutionState({
          errorMessage: i18n.translate(
            'xpack.securitySolution.console.commandValidation.oneArgIsRequired',
            {
              defaultMessage: 'At least one argument must be used',
            }
          ),
        })
      )
    );
  }

  // if the Command definition has a `validate()` callback, then call it now
  if (commandDefinition.validate) {
    const validationResult = commandDefinition.validate(command);

    if (validationResult !== true) {
      return updateStateWithNewCommandHistoryItem(
        state,
        createCommandHistoryEntry(
          cloneCommandDefinitionWithNewRenderComponent(command, BadArgument),
          createCommandExecutionState({
            errorMessage: validationResult,
          })
        )
      );
    }
  }

  // All is good. Execute the command
  return updateStateWithNewCommandHistoryItem(state, createCommandHistoryEntry(command));
};
