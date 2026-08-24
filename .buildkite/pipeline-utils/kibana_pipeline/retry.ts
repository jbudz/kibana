/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { BuildkiteRetry } from '../buildkite';

export const RETRY_INFRA: BuildkiteRetry = { automatic: [{ exit_status: '-1', limit: 3 }] };

export const RETRY_FLAKY: BuildkiteRetry = {
  automatic: [
    { exit_status: '-1', limit: 3 },
    { exit_status: '*', limit: 1 },
  ],
};

export const RETRY_ONCE: BuildkiteRetry = { automatic: [{ exit_status: '*', limit: 1 }] };

export const NO_RETRY: BuildkiteRetry = { automatic: false };
