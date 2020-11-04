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

import crypto from 'crypto';
import { join } from 'path';

import { Config } from '@kbn/config';

import { safeLoad } from 'js-yaml';
import { getConfigDirectory } from '@kbn/utils';

export class EncryptionConfig {
  constructor() {
    this._config = safeLoad(join(getConfigDirectory(), 'kibana.yml'));
    this._encryptionKeyPath = 'xpack.encryptedSavedObjects.encryptionKey';
    this._decryptionKeyPath = 'xpack.encryptedSavedObjects.keyRotation.decryptionOnlyKeys';
  }

  _getEncryptionKey() {
    return Config.get(this._encryptionKeyPath);
  }

  _getDecryptionKeys() {
    return Config.get(this._decryptionKeyPath) || [];
  }

  hasEncryptionKey() {
    return !!this._getEncryptionKey();
  }

  generateEncryptionKey() {
    return crypto.randomBytes(16).toString('hex');
  }

  writeEncryptionKey(key) {
    //TODO: config.write
    console.log(key);
  }

  writeDecryptionKeys(keys) {
    //TODO: config.write
    console.log(keys);
  }

  generate() {
    const decryptionKeys = this._getDecryptionKeys();
    const encryptionKey = this._getEncryptionKey();
    if (encryptionKey) {
      decryptionKeys.push(encryptionKey);
      this.writeDecryptionKeys(decryptionKeys);
    }
    const newEncryptionKey = this.generateEncryptionKey();
    this.writeEncryptionKey(newEncryptionKey);
  }
}
