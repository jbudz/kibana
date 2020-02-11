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

import { writeFileSync } from 'fs';

import { baseConfig } from './base_config';
import unionWith from 'lodash.unionwith';
import { isEqual } from 'lodash';

export class Config {
  constructor() {
    this.baseConfig = baseConfig();
  }

  generate(target = 'package') {
    if (!this.targets[target]) {
      throw new Error(`Invalid target.  Try one of ${Object.keys(this.targets)}`);
    }

    const settings = unionWith(this.targets[target].settings, this.baseConfig, (a, b) => {
      return isEqual(a.key, b.key);
    }).sort((a, b) => {
      return a.key.localeCompare(b.key);
    });
    const output = settings
      .map(setting => {
        const description = [].concat(setting.description).join('\n# ');
        const configuration = `${!setting.active && '#'}${setting.key}: ${setting.value}`;
        return `# ${description}\n${configuration}\n`;
      })
      .join('\n');

    return output;
  }

  write(path, target) {
    writeFileSync(path, this.generate(target));
  }

  targets = {
    package: {
      description: 'deb and rpm distributions',
      settings: [
        {
          key: 'path.data',
          value: '/var/lib/kibana',
          active: true,
        },
      ],
    },

    docker: {
      description: 'docker distributions',
      settings: {},
    },

    archive: {
      description: 'zip and tar.gz distributions',
      settings: {},
    },
  };
}
