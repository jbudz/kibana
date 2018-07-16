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

import Joi from 'joi';
import Boom from 'boom';
import { isString } from 'lodash';

export function createProxy(server) {
  const { callWithRequest } =  server.plugins.elasticsearch.getCluster('data');

  server.ext('onRequest', (req, reply) => {
    try {
      const contentType = req.headers['content-type'];
      const applicationNDJSON = 'application/x-ndjson';
      const textPlain = 'text/plain';
      const isNDJSON = () => contentType.includes(applicationNDJSON);
      if (isString(contentType) && isNDJSON()) {
        req.headers['content-type'] = contentType.replace(applicationNDJSON, textPlain);
      }
    } finally {
      reply.continue();
    }

  });

  server.route({
    method: 'POST',
    path: '/elasticsearch/_msearch',
    async handler(req, reply) {
      const { payload } = req;
      try {
        const body = payload.split('\n').filter(Boolean).map(JSON.parse);
        const response = await callWithRequest(req, 'msearch', {
          body
        });
        reply(response);
      } catch(e) {
        reply(Boom.badRequest(e));
      }
    },
  });

  server.route({
    method: 'POST',
    path: '/elasticsearch/{index}/_search',
    config: {
      validate: {
        params: Joi.object().keys({
          index: Joi.string().required()
        })
      }
    },
    async handler(req, reply) {
      const { body } = req;
      try {
        const response = await callWithRequest(req, 'search', {
          index: req.params.index,
          body
        });
        reply(response);
      } catch(e) {
        reply(Boom.badRequest(e));
      }
    }
  });
}
