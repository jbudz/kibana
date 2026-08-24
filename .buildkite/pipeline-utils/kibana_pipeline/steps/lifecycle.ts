/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type {
  BuildkiteCommandStep,
  BuildkiteRetry,
  BuildkiteTriggerStep,
  BuildkiteWaitStep,
} from '../../buildkite';
import { RETRY_INFRA, RETRY_ONCE } from '../retry';

export const wait = (overrides: Partial<BuildkiteWaitStep> = {}): BuildkiteWaitStep => ({
  wait: null,
  ...overrides,
});

export const preBuildStep = (): BuildkiteCommandStep => ({
  command: '.buildkite/scripts/lifecycle/pre_build.sh',
  label: 'Pre-Build',
  key: 'pre_build',
  agents: { machineType: 'n2-standard-2' },
  timeout_in_minutes: 10,
  retry: RETRY_ONCE,
});

export const storeCacheStep = (
  overrides: Partial<BuildkiteCommandStep> = {}
): BuildkiteCommandStep => ({
  command: '.buildkite/scripts/steps/store_cache.sh',
  label: 'Store Cache for build',
  id: 'store_cache',
  agents: { machineType: 'n2-highcpu-8' },
  timeout_in_minutes: 10,
  soft_fail: true,
  ...overrides,
});

export const ciStatsReadyStep = (dependsOn: string[] = ['build']): BuildkiteCommandStep => ({
  command: '.buildkite/scripts/steps/ci_stats_ready.sh',
  label: 'Mark CI Stats as ready',
  key: 'ci_stats_ready',
  agents: { machineType: 'n2-standard-2' },
  timeout_in_minutes: 10,
  depends_on: dependsOn,
  retry: RETRY_ONCE,
});

export const reportPackageMetricsStep = (
  retry: BuildkiteRetry = RETRY_INFRA
): BuildkiteCommandStep => ({
  command: '.buildkite/scripts/steps/report_package_metrics.sh',
  label: 'Report Package Metrics',
  key: 'report_package_metrics',
  agents: { machineType: 'n2-standard-2' },
  timeout_in_minutes: 15,
  retry,
});

export const postBuildStep = (): BuildkiteCommandStep => ({
  command: '.buildkite/scripts/lifecycle/post_build.sh',
  label: 'Post-Build',
  agents: { machineType: 'n2-standard-2' },
  timeout_in_minutes: 10,
});

export const dockerImageTriggerStep = (): BuildkiteCommandStep => ({
  command: '.buildkite/scripts/steps/artifacts/docker_image_trigger.sh',
  label: 'Trigger container image build',
  agents: { machineType: 'n2-standard-2' },
  timeout_in_minutes: 10,
  retry: RETRY_ONCE,
});

export const securitySolutionTriggerStep = (): BuildkiteTriggerStep => ({
  label: 'Trigger Security Solution on-merge tests',
  trigger: 'kibana-security-solution-on-merge',
  async: false,
  soft_fail: true,
  depends_on: ['build'],
  build: {
    branch: '${BUILDKITE_BRANCH}',
    commit: '${BUILDKITE_COMMIT}',
    env: { KIBANA_BUILD_ID: '${BUILDKITE_BUILD_ID}' },
  },
});

export const verifyFipsEnabledStep = (): BuildkiteCommandStep => ({
  command: '.buildkite/pipelines/fips/verify_fips_enabled.sh',
  label: 'Verify FIPS Enabled',
  agents: { machineType: 'n2-standard-2', preemptible: true },
  timeout_in_minutes: 10,
});
