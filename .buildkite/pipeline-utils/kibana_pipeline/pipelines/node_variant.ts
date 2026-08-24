/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { BuildkiteCommandStep } from '../../buildkite';
import type { EmitPipelineDocument } from '../../buildkite/utils';
import { onMergeBuildStep } from '../steps/build';
import { postBuildStep, preBuildStep, wait } from '../steps/lifecycle';
import { securityCypressSteps } from '../steps/security_cypress';
import { pickTestGroupRunOrderStep, scoutTestRunBuilderStep } from '../steps/test_selection';

const nodeVariantPipeline = (
  env: EmitPipelineDocument['env'],
  buildEnv?: BuildkiteCommandStep['env']
): EmitPipelineDocument => ({
  env,
  steps: [
    preBuildStep(),
    wait(),
    onMergeBuildStep({
      agents: { machineType: 'n2-standard-16', preemptible: true, diskSizeGb: 200 },
      ...(buildEnv ? { env: buildEnv } : {}),
    }),
    wait(),
    pickTestGroupRunOrderStep({ agents: { machineType: 'n2-standard-2' } }),
    scoutTestRunBuilderStep(),
    ...securityCypressSteps('variant'),
    wait({ continue_on_failure: true }),
    postBuildStep(),
  ],
});

export const nodeGlibc217Pipeline = (): EmitPipelineDocument =>
  nodeVariantPipeline({ CI_FORCE_NODE_GLIBC_217: 'true' });

// The distribution is built without pointer compression; only the test runtime uses it.
export const nodePointerCompressionPipeline = (): EmitPipelineDocument =>
  nodeVariantPipeline(
    { CI_FORCE_NODE_POINTER_COMPRESSION: 'true' },
    { CI_FORCE_NODE_POINTER_COMPRESSION: 'false' }
  );
