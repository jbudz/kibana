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

import { baseConfig } from './base_config';
import unionWith from 'lodash.unionWith';

export class Config {
  constructor() {
    this.baseConfig = baseConfig();
  }

  generate(target = 'package') {
    let output = '';
    if (!this.targets[target]) throw new Error(`Invalid target.  Try one of ${Object.keys(this.targets)}`);
    const settings = unionBy(this.baseConfig, this.targets[target].settings, () => ));
    settings.forEach(setting => {
      output += `# ${[].concat(setting.description).join('\n# ')}\n`;
      output += `${!setting.active && '#'}${setting.key}: ${setting.value}\n\n`;
    });
    console.log(settings);
  }

  targets = {
    package: {
      description: 'deb and rpm distributions',
      settings: {
        key: 'path.data',
        value: '/var/lib/kibana',
      },
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
