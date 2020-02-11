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

export function baseConfig() {
  return [
    {
      key: 'server.port',
      value: 5601,
      active: false,
      description: 'Kibana is served by a back end server. This setting specifies the port to use.',
    },
    {
      key: 'server.host',
      value: 'localhost',
      active: false,
      description: [
        'Specifies the address to which the Kibana server will bind. IP addresses and host names are both valid values.',
        "The default is 'localhost', which usually means remote machines will not be able to connect.",
        'To allow connections from remote users, set this parameter to a non-loopback address.',
      ],
    },
    {
      key: 'server.basePath',
      value: '""',
      active: false,
      description: [
        'Enables you to specify a path to mount Kibana at if you are running behind a proxy.',
        'Use the `server.rewriteBasePath` setting to tell Kibana if it should remove the basePath',
        'from requests it receives, and to prevent a deprecation warning at startup.',
        'This setting cannot end in a slash.',
      ],
    },
    {
      key: 'server.rewriteBasePath',
      value: false,
      active: false,
      description: [
        'Specifies whether Kibana should rewrite requests that are prefixed with',
        '`server.basePath` or require that they are rewritten by your reverse proxy.',
      ],
    },
    {
      key: 'server.maxPayloadBytes',
      value: 1048576,
      active: false,
      description: 'The maximum payload size in bytes for incoming server requests.',
    },
    {
      key: 'server.name',
      value: 'your-hostname',
      active: false,
      description: "The Kibana server's name.  This is used for display purposes.",
    },
    {
      key: 'elasticsearch.hosts',
      value: '["http://localhost:9200"]',
      active: false,
      description: 'The URLs of the Elasticsearch instances to use for all your queries.',
    },
    {
      key: 'kibana.index',
      value: '.kibana',
      active: false,
      description: [
        'Kibana uses an index in Elasticsearch to store saved searches, visualizations and',
        "dashboards. Kibana creates a new index if the index doesn't already exist.",
      ],
    },
    {
      key: 'kibana.defaultAppId',
      value: 'home',
      active: false,
      description: 'The default application to load.',
    },
    {
      key: 'server.name',
      value: 'your-hostname',
      active: false,
      description: "The Kibana server's name.  This is used for display purposes.",
    },
    {
      key: 'server.name',
      value: 'your-hostname',
      active: false,
      description: "The Kibana server's name.  This is used for display purposes.",
    },
    {
      key: 'server.name',
      value: 'your-hostname',
      active: false,
      description: "The Kibana server's name.  This is used for display purposes.",
    },
  ];
}
