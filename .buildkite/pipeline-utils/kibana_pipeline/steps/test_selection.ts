/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { BuildkiteCommandStep } from '../../buildkite';
import { RETRY_ONCE } from '../retry';

const SPARSE_CHECKOUT = {
  'sparse-checkout#v1.6.0': {
    no_cone: true,
    paths: [
      '/.buildkite/',
      '/.node-version',
      '/package.json',
      '/tsconfig.base.json',
      '/versions.json',
      '/kibana.jsonc',
      '**/kibana.jsonc',
      '**/tsconfig.json',
      '**/jest.config.js',
      '**/jest.integration.config.js',
      '**/*.test.js',
      '**/*.test.mjs',
      '**/*.test.ts',
      '**/*.test.tsx',
    ],
    cleanup_sparse_state: true,
    post_checkout: { unshallow: true },
  },
};

export const pickTestGroupRunOrderStep = ({
  env,
  agents,
}: Pick<Partial<BuildkiteCommandStep>, 'env' | 'agents'> = {}): BuildkiteCommandStep => ({
  command: '.buildkite/scripts/steps/test/pick_test_group_run_order.sh',
  label: 'Pick Test Group Run Order',
  key: 'pick_test_group_run_order',
  ...(agents
    ? { agents }
    : {
        agents: {
          provider: 'k8s',
          image: 'docker.elastic.co/ci-agent-images/kibana/ci-minimal',
          imageUID: '1000',
        },
        plugins: [SPARSE_CHECKOUT],
      }),
  timeout_in_minutes: 15,
  env: {
    JEST_UNIT_SCRIPT: '.buildkite/scripts/steps/test/jest.sh',
    JEST_INTEGRATION_SCRIPT: '.buildkite/scripts/steps/test/jest_integration.sh',
    FTR_CONFIGS_SCRIPT: '.buildkite/scripts/steps/test/ftr_configs.sh',
    FTR_TEST_CHANNELS: 'ci-on-commit',
    ...env,
  },
  retry: RETRY_ONCE,
});

export const SCOUT_LANE_TUNING = {
  SCOUT_TEST_SERVER_START_TIMEOUT_SECONDS: 300,
  SCOUT_TEST_LANE_ESTIMATED_SETUP_MINUTES: 5,
} as const;

export const scoutTestRunBuilderStep = (
  env?: BuildkiteCommandStep['env']
): BuildkiteCommandStep => ({
  command: '.buildkite/scripts/steps/test/scout/test_run_builder.sh',
  label: 'Scout Test Run Builder',
  key: 'build_scout_tests',
  agents: { machineType: 'n2d-standard-8' },
  timeout_in_minutes: 20,
  env: {
    SCOUT_TEST_DISTRIBUTION_STRATEGY: 'lanes',
    SCOUT_TEST_LANES_GROUP_DEPS: 'build_scout_tests,build',
    SCOUT_TEST_CHANNELS: 'ci-on-commit',
    SCOUT_TEST_LANE_TARGET_RUNTIME_MINUTES: 20,
    ...env,
  },
  retry: RETRY_ONCE,
});
