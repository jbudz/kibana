/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { BuildkiteCommandStep } from '../../buildkite';
import { C4D_ZONES } from '../agents';
import { RETRY_INFRA, RETRY_ONCE } from '../retry';

// [rspack-transition] Restore `if: build.env('KIBANA_BUILD_ID') == null || build.env('KIBANA_BUILD_ID') == ''`
// once the legacy optimizer is removed.
export const buildStep = (overrides: Partial<BuildkiteCommandStep> = {}): BuildkiteCommandStep => ({
  command: '.buildkite/scripts/steps/build_kibana.sh',
  label: 'Build Kibana Distribution',
  key: 'build',
  agents: {
    image: 'family/kibana-minimal-ubuntu-2604',
    machineType: 'c4d-standard-16',
    diskType: 'hyperdisk-balanced',
    diskSizeGb: 50,
    buildDirectory: '/dev/shm/bk',
    zones: C4D_ZONES,
  },
  timeout_in_minutes: 60,
  retry: RETRY_INFRA,
  ...overrides,
});

// A failed on-merge build blocks everyone, so it also retries once on any failure.
export const onMergeBuildStep = (
  overrides: Partial<BuildkiteCommandStep> = {}
): BuildkiteCommandStep =>
  buildStep({
    command: '.buildkite/scripts/steps/on_merge_build_and_metrics.sh',
    retry: RETRY_ONCE,
    ...overrides,
  });
