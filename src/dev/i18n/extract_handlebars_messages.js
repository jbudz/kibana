/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import chalk from 'chalk';

import { formatJSString } from './utils';
import { createFailError } from '../run';

const HBS_REGEX = /(?<=\{\{)([\s\S]*?)(?=\}\})/g;
const TOKENS_REGEX = /[^'\s]+|(?:'([^'\\]|\\[\s\S])*')/g;

/**
 * Example: `'{{i18n 'message-id' '{"defaultMessage": "Message text"}'}}'`
 */
export function* extractHandlebarsMessages(buffer) {
  for (const expression of buffer.toString().match(HBS_REGEX) || []) {
    const tokens = expression.match(TOKENS_REGEX);

    const [functionName, idString, propertiesString] = tokens;

    if (functionName !== 'i18n') {
      continue;
    }

    if (tokens.length !== 3) {
      throw createFailError(
        `${chalk.white.bgRed(' I18N ERROR ')} Wrong number of arguments for handlebars i18n call.`
      );
    }

    if (!idString.startsWith(`'`) || !idString.endsWith(`'`)) {
      throw createFailError(
        `${chalk.white.bgRed(' I18N ERROR ')} Message id should be a string literal.`
      );
    }

    const messageId = formatJSString(idString.slice(1, -1));

    if (!messageId) {
      throw createFailError(
        `${chalk.white.bgRed(' I18N ERROR ')} Empty id argument in Handlebars i18n is not allowed.`
      );
    }

    if (!propertiesString.startsWith(`'`) || !propertiesString.endsWith(`'`)) {
      throw createFailError(
        `${chalk.white.bgRed(' I18N ERROR ')} \
Properties string in Handlebars i18n should be a string literal ("${messageId}").`
      );
    }

    const properties = JSON.parse(propertiesString.slice(1, -1));
    const message = formatJSString(properties.defaultMessage);

    if (typeof message !== 'string') {
      throw createFailError(
        `${chalk.white.bgRed(' I18N ERROR ')} \
defaultMessage value in Handlebars i18n should be a string ("${messageId}").`
      );
    }

    if (!message) {
      throw createFailError(
        `${chalk.white.bgRed(' I18N ERROR ')} \
Empty defaultMessage in Handlebars i18n is not allowed ("${messageId}").`
      );
    }

    const context = formatJSString(properties.context);

    if (context != null && typeof context !== 'string') {
      throw createFailError(
        `${chalk.white.bgRed(' I18N ERROR ')} \
Context value in Handlebars i18n should be a string ("${messageId}").`
      );
    }

    yield [messageId, { message, context }];
  }
}
