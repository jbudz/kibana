/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { EmitPipelineDocument } from '../../buildkite/utils';
import { RETRY_FLAKY } from '../retry';
import { onMergeBuildStep } from '../steps/build';
import {
  checkOasSnapshotStep,
  checksStep,
  checkTypesStep,
  lintingStep,
  lintingWithOxlintStep,
  lintingWithTypesStep,
  quickChecksStep,
} from '../steps/checks';
import {
  ciStatsReadyStep,
  dockerImageTriggerStep,
  postBuildStep,
  preBuildStep,
  reportPackageMetricsStep,
  securitySolutionTriggerStep,
  storeCacheStep,
  wait,
} from '../steps/lifecycle';
import {
  archiveSoMigrationSnapshotStep,
  publishOasDocsStep,
  storybooksStep,
} from '../steps/publishing';
import {
  pickTestGroupRunOrderStep,
  SCOUT_LANE_TUNING,
  scoutTestRunBuilderStep,
} from '../steps/test_selection';

export const onMergePipeline = (): EmitPipelineDocument => ({
  env: {
    GITHUB_COMMIT_STATUS_ENABLED: 'true',
    GITHUB_COMMIT_STATUS_CONTEXT: 'buildkite/on-merge',
  },
  steps: [
    preBuildStep(),
    pickTestGroupRunOrderStep({ env: { FTR_CONFIGS_DEPS: 'build' } }),
    wait({ depends_on: 'pre_build' }),
    storeCacheStep({ depends_on: ['terrazzo-initial-pipeline-upload'] }),
    onMergeBuildStep(),
    quickChecksStep(),
    checksStep(),
    lintingStep(),
    lintingWithTypesStep(),
    lintingWithOxlintStep(),
    checkTypesStep({ UPLOAD_ARCHIVE: 'true' }),
    checkOasSnapshotStep(),
    reportPackageMetricsStep(RETRY_FLAKY),
    ciStatsReadyStep(['build', 'report_package_metrics']),
    scoutTestRunBuilderStep(SCOUT_LANE_TUNING),
    securitySolutionTriggerStep(),
    storybooksStep(),
    publishOasDocsStep(),
    archiveSoMigrationSnapshotStep(),
    wait({ continue_on_failure: true }),
    postBuildStep(),
    wait(),
    dockerImageTriggerStep(),
  ],
});
