/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { BuildkiteCommandStep } from '../../buildkite';
import { N2D_SPOT_ZONES, n4Spot, spot } from '../agents';
import { RETRY_INFRA } from '../retry';

type Env = BuildkiteCommandStep['env'];

const check = (
  key: string,
  label: string,
  script: string,
  agents: BuildkiteCommandStep['agents'],
  env?: Env
): BuildkiteCommandStep => ({
  command: `.buildkite/scripts/steps/${script}`,
  label,
  key,
  agents,
  timeout_in_minutes: 60,
  ...(env ? { env } : {}),
  retry: RETRY_INFRA,
});

export const quickChecksStep = (env?: Env): BuildkiteCommandStep =>
  check(
    'quick_checks',
    'Quick Checks',
    'quick_checks.sh',
    spot('n2d-standard-8', N2D_SPOT_ZONES),
    env
  );

export const checksStep = (env?: Env): BuildkiteCommandStep =>
  check('checks', 'Checks', 'checks.sh', spot('n2d-standard-2', N2D_SPOT_ZONES), env);

export const lintingStep = (env?: Env): BuildkiteCommandStep =>
  check('linting', 'Linting', 'lint.sh', n4Spot('n4-standard-16'), env);

export const lintingWithTypesStep = (env?: Env): BuildkiteCommandStep =>
  check(
    'linting_with_types',
    'Linting (with types)',
    'lint_with_types.sh',
    n4Spot('n4-standard-32'),
    env
  );

export const lintingWithOxlintStep = (env?: Env): BuildkiteCommandStep =>
  check(
    'linting_with_oxlint',
    'Linting (with oxlint)',
    'lint_with_oxlint.sh',
    n4Spot('n4-standard-4'),
    env
  );

export const checkTypesStep = (env?: Env): BuildkiteCommandStep =>
  check('check_types', 'Check Types', 'typecheck/check_types.sh', n4Spot('n4-highcpu-32'), env);

export const checkOasSnapshotStep = (): BuildkiteCommandStep =>
  check(
    'check_oas_snapshot',
    'Check OAS Snapshot',
    'checks/capture_oas_snapshot.sh',
    spot('n2d-highmem-4', N2D_SPOT_ZONES)
  );
