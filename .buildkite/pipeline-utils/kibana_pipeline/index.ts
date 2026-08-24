/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { chromeForwardTestingPipeline } from './pipelines/chrome_forward_testing';
import { fipsPipeline } from './pipelines/fips';
import { mergeQueuePipeline } from './pipelines/merge_queue';
import { nodeGlibc217Pipeline, nodePointerCompressionPipeline } from './pipelines/node_variant';
import { onMergePipeline } from './pipelines/on_merge';
import { securitySolutionOnMergePipeline } from './pipelines/security_solution_on_merge';

export { pullRequestPipeline } from './pipelines/pull_request';
export { prSecurityCypressSteps, SECURITY_CYPRESS_SUITES } from './steps/security_cypress';

export const PIPELINES = {
  chrome_forward_testing: chromeForwardTestingPipeline,
  fips: fipsPipeline,
  merge_queue: mergeQueuePipeline,
  node_glibc_217: nodeGlibc217Pipeline,
  node_pointer_compression: nodePointerCompressionPipeline,
  on_merge: onMergePipeline,
  security_solution_on_merge: securitySolutionOnMergePipeline,
};
