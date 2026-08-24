/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { EmitPipelineDocument } from '../../buildkite/utils';
import { buildStep } from '../steps/build';
import {
  postBuildStep,
  preBuildStep,
  storeCacheStep,
  verifyFipsEnabledStep,
  wait,
} from '../steps/lifecycle';
import { pickTestGroupRunOrderStep, scoutTestRunBuilderStep } from '../steps/test_selection';

// getAgentImageConfig() selects the FIPS image via TEST_ENABLE_FIPS_VERSION.
export const fipsPipeline = (): EmitPipelineDocument => ({
  env: {
    DISABLE_CI_STATS_SHIPPING: 'true',
    TEST_BROWSER_HEADLESS: 1,
  },
  steps: [
    preBuildStep(),
    wait(),
    storeCacheStep({ depends_on: ['terrazzo-initial-pipeline-upload'] }),
    buildStep({
      if: "build.env('KIBANA_BUILD_ID') == null || build.env('KIBANA_BUILD_ID') == ''",
      agents: { machineType: 'n2-standard-8', preemptible: true, diskSizeGb: 200 },
    }),
    wait(),
    verifyFipsEnabledStep(),
    pickTestGroupRunOrderStep({
      env: { FTR_EXTRA_ARGS: '$FTR_EXTRA_ARGS' },
      agents: { machineType: 'n2-standard-2' },
    }),
    scoutTestRunBuilderStep({ SELECTIVE_TESTING_ENABLED: 'false' }),
    wait({ continue_on_failure: true }),
    postBuildStep(),
  ],
});
