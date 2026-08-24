/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { EmitPipelineDocument } from '../../buildkite/utils';
import { securityCypressSteps } from '../steps/security_cypress';

// Triggered by on-merge with KIBANA_BUILD_ID pointing at the parent build.
export const securitySolutionOnMergePipeline = (): EmitPipelineDocument => ({
  steps: securityCypressSteps('on_merge'),
});
