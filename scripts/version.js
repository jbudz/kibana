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

var fs = require('fs');
var path = require('path');
var program = require('commander');
var semver = require('semver');
var git = require('simple-git')();

program.command('bump <version>').action(function (version) {
  if (!semver.valid(version)) {
    throw new Error('invalid version ' + version);
  }

  [
    path.resolve(__dirname, '../package.json'),
    path.resolve(__dirname, '../x-pack/package.json'),
    path.resolve(__dirname, '../x-pack/plugins/infra/package.json')
  ].forEach(function (file) {
    var content = JSON.parse(fs.readFileSync(file));
    content.version = version;
    fs.writeFileSync(file, JSON.stringify(content, null, 2) + '\n');
    git.add(file);
  });

  git.commit('v' + version);
});

program.parse(process.argv);
