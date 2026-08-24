/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { stringify } from 'yaml';
import { PIPELINES, pullRequestPipeline, SECURITY_CYPRESS_SUITES } from '..';

describe('pipelines', () => {
  for (const [name, pipeline] of Object.entries({
    ...PIPELINES,
    pull_request: pullRequestPipeline,
  })) {
    it(`${name} matches snapshot`, () => {
      expect(stringify(pipeline())).toMatchSnapshot();
    });
  }

  it('security cypress PR step keys are unique', () => {
    const keys = SECURITY_CYPRESS_SUITES.map((suite) => suite.prKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
