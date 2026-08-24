/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { emitPipeline, getAgentImageConfig, PIPELINES } from '#pipeline-utils';

const name = process.argv[2] as keyof typeof PIPELINES;
if (!PIPELINES[name]) {
  console.error(
    `Unknown pipeline "${name}"; expected one of: ${Object.keys(PIPELINES).join(', ')}`
  );
  process.exit(1);
}

emitPipeline({ agents: getAgentImageConfig(), ...PIPELINES[name]() });
