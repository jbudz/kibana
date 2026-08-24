/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { BuildkiteAgentTargetingRule } from '../buildkite';

// Zones per machine family. The Jest/FTR fleet (agent_images.ts) intentionally uses cheaper
// non-US n2 spot zones; keep these lists separate from it.
export const C4D_ZONES =
  'us-central1-a,us-central1-b,us-central1-c,us-central1-f,us-east1-b,us-east1-c,us-east1-d';
export const N2_SPOT_ZONES = 'us-central1-f,us-central1-c,us-central1-a';
export const N2D_SPOT_ZONES = 'us-central1-b,us-central1-c,us-central1-f';
export const N4_SPOT_ZONES =
  'us-central1-a,us-central1-b,us-central1-c,us-central1-f,us-east1-b,us-east1-c,us-east1-d,us-west1-a,us-west1-b,us-west1-c';

// Image and default disk come from the pipeline-level agents block; steps only declare what differs.
export const spot = (machineType: string, spotZones: string): BuildkiteAgentTargetingRule => ({
  machineType,
  preemptible: true,
  spotZones,
});

// n4 machines require hyperdisk.
export const n4Spot = (machineType: string): BuildkiteAgentTargetingRule => ({
  ...spot(machineType, N4_SPOT_ZONES),
  diskType: 'hyperdisk-balanced',
});
