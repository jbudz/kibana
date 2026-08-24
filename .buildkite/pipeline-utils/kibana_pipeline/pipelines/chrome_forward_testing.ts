/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { EmitPipelineDocument } from '../../buildkite/utils';
import { RETRY_ONCE } from '../retry';
import { buildStep } from '../steps/build';
import {
  ciStatsReadyStep,
  postBuildStep,
  preBuildStep,
  storeCacheStep,
  wait,
} from '../steps/lifecycle';
import { securityCypressSteps } from '../steps/security_cypress';
import { pickTestGroupRunOrderStep, scoutTestRunBuilderStep } from '../steps/test_selection';

export const chromeForwardTestingPipeline = (): EmitPipelineDocument => ({
  env: {
    GITHUB_COMMIT_STATUS_ENABLED: 'false',
    USE_CHROME_BETA: 'true',
  },
  steps: [
    preBuildStep(),
    storeCacheStep(),
    wait(),
    buildStep({
      agents: { machineType: 'n2-standard-8', preemptible: true, diskSizeGb: 200 },
      retry: RETRY_ONCE,
    }),
    wait(),
    ciStatsReadyStep(),
    pickTestGroupRunOrderStep({
      env: { LIMIT_CONFIG_TYPE: 'functional' },
      agents: { machineType: 'n2-standard-2' },
    }),
    scoutTestRunBuilderStep(),
    ...securityCypressSteps('variant'),
    wait({ continue_on_failure: true }),
    postBuildStep(),
  ],
});
