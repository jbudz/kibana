/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { EmitPipelineDocument } from '../../buildkite/utils';
import { onMergeBuildStep } from '../steps/build';
import {
  checksStep,
  checkTypesStep,
  lintingStep,
  lintingWithTypesStep,
  quickChecksStep,
} from '../steps/checks';
import { ciStatsReadyStep, postBuildStep, preBuildStep, wait } from '../steps/lifecycle';
import { pickTestGroupRunOrderStep } from '../steps/test_selection';

export const mergeQueuePipeline = (): EmitPipelineDocument => ({
  env: {
    GITHUB_COMMIT_STATUS_ENABLED: 'true',
    GITHUB_COMMIT_STATUS_CONTEXT: 'kibana-ci',
  },
  steps: [
    preBuildStep(),
    pickTestGroupRunOrderStep({
      env: { JEST_UNIT_MAX_MINUTES: '15.0', LIMIT_CONFIG_TYPE: 'unit' },
    }),
    wait({ depends_on: 'pre_build' }),
    onMergeBuildStep(),
    quickChecksStep(),
    checksStep(),
    lintingStep(),
    lintingWithTypesStep(),
    checkTypesStep(),
    ciStatsReadyStep(),
    wait({ continue_on_failure: true }),
    postBuildStep(),
  ],
});
