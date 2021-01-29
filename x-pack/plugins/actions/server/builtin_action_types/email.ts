/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { curry } from 'lodash';
import { i18n } from '@kbn/i18n';
import { schema, TypeOf } from '@kbn/config-schema';
import nodemailerGetService from 'nodemailer/lib/well-known';

import { sendEmail, JSON_TRANSPORT_SERVICE, SendEmailOptions, Transport } from './lib/send_email';
import { portSchema } from './lib/schemas';
import { Logger } from '../../../../../src/core/server';
import { ActionType, ActionTypeExecutorOptions, ActionTypeExecutorResult } from '../types';
import { ActionsConfigurationUtilities } from '../actions_config';
import { renderMustacheString, renderMustacheObject } from '../lib/mustache_renderer';

export type EmailActionType = ActionType<
  ActionTypeConfigType,
  ActionTypeSecretsType,
  ActionParamsType,
  unknown
>;
export type EmailActionTypeExecutorOptions = ActionTypeExecutorOptions<
  ActionTypeConfigType,
  ActionTypeSecretsType,
  ActionParamsType
>;

// config definition
export type ActionTypeConfigType = TypeOf<typeof ConfigSchema>;

const EMAIL_FOOTER_DIVIDER = '\n\n--\n\n';

const ConfigSchemaProps = {
  service: schema.nullable(schema.string()),
  host: schema.nullable(schema.string()),
  port: schema.nullable(portSchema()),
  secure: schema.nullable(schema.boolean()),
  from: schema.string(),
  hasAuth: schema.boolean({ defaultValue: true }),
};

const ConfigSchema = schema.object(ConfigSchemaProps);

function validateConfig(
  configurationUtilities: ActionsConfigurationUtilities,
  configObject: ActionTypeConfigType
): string | void {
  const config = configObject;

  // Make sure service is set, or if not, both host/port must be set.
  // If service is set, host/port are ignored, when the email is sent.
  // Note, not currently making these message translated, as will be
  // emitted alongside messages from @kbn/config-schema, which does not
  // translate messages.
  if (config.service === JSON_TRANSPORT_SERVICE) {
    return;
  } else if (config.service == null) {
    if (config.host == null && config.port == null) {
      return 'either [service] or [host]/[port] is required';
    }

    if (config.host == null) {
      return '[host] is required if [service] is not provided';
    }

    if (config.port == null) {
      return '[port] is required if [service] is not provided';
    }

    if (!configurationUtilities.isHostnameAllowed(config.host)) {
      return `[host] value '${config.host}' is not in the allowedHosts configuration`;
    }
  } else {
    const host = getServiceNameHost(config.service);
    if (host == null) {
      return `[service] value '${config.service}' is not valid`;
    }
    if (!configurationUtilities.isHostnameAllowed(host)) {
      return `[service] value '${config.service}' resolves to host '${host}' which is not in the allowedHosts configuration`;
    }
  }
}

// secrets definition

export type ActionTypeSecretsType = TypeOf<typeof SecretsSchema>;

const SecretsSchema = schema.object({
  user: schema.nullable(schema.string()),
  password: schema.nullable(schema.string()),
});

// params definition

export type ActionParamsType = TypeOf<typeof ParamsSchema>;

const ParamsSchema = schema.object(
  {
    to: schema.arrayOf(schema.string(), { defaultValue: [] }),
    cc: schema.arrayOf(schema.string(), { defaultValue: [] }),
    bcc: schema.arrayOf(schema.string(), { defaultValue: [] }),
    subject: schema.string(),
    message: schema.string(),
    // kibanaFooterLink isn't inteded for users to set, this is here to be able to programatically
    // provide a more contextual URL in the footer (ex: URL to the alert details page)
    kibanaFooterLink: schema.object({
      path: schema.string({ defaultValue: '/' }),
      text: schema.string({
        defaultValue: i18n.translate('xpack.actions.builtin.email.kibanaFooterLinkText', {
          defaultMessage: 'Go to Kibana',
        }),
      }),
    }),
  },
  {
    validate: validateParams,
  }
);

function validateParams(paramsObject: unknown): string | void {
  // avoids circular reference ...
  const params = paramsObject as ActionParamsType;

  const { to, cc, bcc } = params;
  const addrs = to.length + cc.length + bcc.length;

  if (addrs === 0) {
    return 'no [to], [cc], or [bcc] entries';
  }
}

interface GetActionTypeParams {
  logger: Logger;
  publicBaseUrl?: string;
  configurationUtilities: ActionsConfigurationUtilities;
}

// action type definition
export const ActionTypeId = '.email';
export function getActionType(params: GetActionTypeParams): EmailActionType {
  const { logger, publicBaseUrl, configurationUtilities } = params;
  return {
    id: ActionTypeId,
    minimumLicenseRequired: 'gold',
    name: i18n.translate('xpack.actions.builtin.emailTitle', {
      defaultMessage: 'Email',
    }),
    validate: {
      config: schema.object(ConfigSchemaProps, {
        validate: curry(validateConfig)(configurationUtilities),
      }),
      secrets: SecretsSchema,
      params: ParamsSchema,
    },
    renderParameterTemplates,
    executor: curry(executor)({ logger, publicBaseUrl, configurationUtilities }),
  };
}

function renderParameterTemplates(
  params: ActionParamsType,
  variables: Record<string, unknown>
): ActionParamsType {
  return {
    // most of the params need no escaping
    ...renderMustacheObject(params, variables),
    // message however, needs to escaped as markdown
    message: renderMustacheString(params.message, variables, 'markdown'),
  };
}

// action executor

async function executor(
  {
    logger,
    publicBaseUrl,
    configurationUtilities,
  }: {
    logger: GetActionTypeParams['logger'];
    publicBaseUrl: GetActionTypeParams['publicBaseUrl'];
    configurationUtilities: ActionsConfigurationUtilities;
  },
  execOptions: EmailActionTypeExecutorOptions
): Promise<ActionTypeExecutorResult<unknown>> {
  const actionId = execOptions.actionId;
  const config = execOptions.config;
  const secrets = execOptions.secrets;
  const params = execOptions.params;

  const transport: Transport = {};

  if (secrets.user != null) {
    transport.user = secrets.user;
  }
  if (secrets.password != null) {
    transport.password = secrets.password;
  }

  if (config.service !== null) {
    transport.service = config.service;
  } else {
    // already validated service or host/port is not null ...
    transport.host = config.host!;
    transport.port = config.port!;
    transport.secure = getSecureValue(config.secure, config.port);
  }

  const footerMessage = getFooterMessage({
    publicBaseUrl,
    kibanaFooterLink: params.kibanaFooterLink,
  });

  const sendEmailOptions: SendEmailOptions = {
    transport,
    routing: {
      from: config.from,
      to: params.to,
      cc: params.cc,
      bcc: params.bcc,
    },
    content: {
      subject: params.subject,
      message: `${params.message}${EMAIL_FOOTER_DIVIDER}${footerMessage}`,
    },
    hasAuth: config.hasAuth,
    configurationUtilities,
  };

  let result;

  try {
    result = await sendEmail(logger, sendEmailOptions);
  } catch (err) {
    const message = i18n.translate('xpack.actions.builtin.email.errorSendingErrorMessage', {
      defaultMessage: 'error sending email',
    });
    return {
      status: 'error',
      actionId,
      message,
      serviceMessage: err.message,
    };
  }

  return { status: 'ok', data: result, actionId };
}

// utilities

function getServiceNameHost(service: string): string | null {
  const serviceEntry = nodemailerGetService(service);
  if (serviceEntry === false) return null;

  // in theory this won't happen, but it's JS, so just to be safe ...
  if (serviceEntry == null) return null;

  return serviceEntry.host || null;
}

// Returns the secure value - whether to use TLS or not.
// Respect value if not null | undefined.
// Otherwise, if the port is 465, return true, otherwise return false.
// Based on data here:
// - https://github.com/nodemailer/nodemailer/blob/master/lib/well-known/services.json
function getSecureValue(secure: boolean | null | undefined, port: number | null): boolean {
  if (secure != null) return secure;
  if (port === 465) return true;
  return false;
}

function getFooterMessage({
  publicBaseUrl,
  kibanaFooterLink,
}: {
  publicBaseUrl: GetActionTypeParams['publicBaseUrl'];
  kibanaFooterLink: ActionParamsType['kibanaFooterLink'];
}) {
  if (!publicBaseUrl) {
    return i18n.translate('xpack.actions.builtin.email.sentByKibanaMessage', {
      defaultMessage: 'This message was sent by Kibana.',
    });
  }

  return i18n.translate('xpack.actions.builtin.email.customViewInKibanaMessage', {
    defaultMessage: 'This message was sent by Kibana. [{kibanaFooterLinkText}]({link}).',
    values: {
      kibanaFooterLinkText: kibanaFooterLink.text,
      link: `${publicBaseUrl}${kibanaFooterLink.path === '/' ? '' : kibanaFooterLink.path}`,
    },
  });
}
