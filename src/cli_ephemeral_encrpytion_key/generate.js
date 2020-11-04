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

import { Logger } from '../cli_plugin/lib/logger';

export async function generate(encryptionConfig, command, options) {
  const logger = new Logger(options);
  encryptionConfig.generate();
  logger.log(`Created new encrpytion key`);
}

export function generateCli(program, encryptionConfig) {
  program
    .command('generate')
    .description('Generates a new ephemeral encrpytion key')
    .option('-s, --silent', 'prevent all logging')
    .action(generate.bind(null, encryptionConfig));
}
