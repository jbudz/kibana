/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { BuildkiteCommandStep } from '../../buildkite';
import { N2_SPOT_ZONES, n4Spot, spot } from '../agents';
import { RETRY_INFRA } from '../retry';

export const storybooksStep = (): BuildkiteCommandStep => ({
  command: '.buildkite/scripts/steps/storybooks/build_and_upload.sh',
  label: 'Build Storybooks',
  key: 'storybooks',
  agents: n4Spot('n4-standard-16'),
  depends_on: ['build'],
  timeout_in_minutes: 60,
  retry: RETRY_INFRA,
});

export const publishOasDocsStep = (): BuildkiteCommandStep => ({
  command: '.buildkite/scripts/steps/openapi_publishing/publish_oas_docs.sh',
  label: 'Publish OAS docs to bump.sh',
  agents: spot('n2-standard-2', N2_SPOT_ZONES),
  depends_on: ['build'],
  timeout_in_minutes: 60,
  soft_fail: true,
  retry: RETRY_INFRA,
});

export const archiveSoMigrationSnapshotStep = (): BuildkiteCommandStep => ({
  command:
    '.buildkite/scripts/steps/archive_so_migration_snapshot.sh target/plugin_so_types_snapshot.json',
  label: 'Extract Saved Object migration plugin types',
  agents: spot('n2-standard-4', N2_SPOT_ZONES),
  artifact_paths: 'target/plugin_so_types_snapshot.json',
  depends_on: ['build'],
  timeout_in_minutes: 30,
  retry: RETRY_INFRA,
});
