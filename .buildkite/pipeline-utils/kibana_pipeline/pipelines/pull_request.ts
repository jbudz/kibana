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
  checksStep,
  checkTypesStep,
  lintingStep,
  lintingWithOxlintStep,
  lintingWithTypesStep,
  quickChecksStep,
} from '../steps/checks';
import { ciStatsReadyStep, reportPackageMetricsStep } from '../steps/lifecycle';
import {
  pickTestGroupRunOrderStep,
  SCOUT_LANE_TUNING,
  scoutTestRunBuilderStep,
} from '../steps/test_selection';

const GATE = { CHECK_GATE: 'true' };

export const pullRequestPipeline = (): EmitPipelineDocument => ({
  env: { KBN_ES_SNAPSHOT_USE_CACHED: 'true' },
  steps: [
    buildStep(),
    quickChecksStep(GATE),
    checksStep(GATE),
    lintingStep(GATE),
    lintingWithTypesStep(GATE),
    lintingWithOxlintStep(GATE),
    checkTypesStep({ ...GATE, RESTORE_ARCHIVE: 'true', UPLOAD_ARCHIVE: 'true' }),
    pickTestGroupRunOrderStep({ env: { FTR_CONFIGS_DEPS: 'build' } }),
    scoutTestRunBuilderStep({ ...SCOUT_LANE_TUNING, SELECTIVE_TESTING_ENABLED: 'true' }),
    ciStatsReadyStep(['build', 'report_package_metrics']),
    reportPackageMetricsStep(),
  ],
});
