/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { parse as loadYaml } from 'yaml';
import { pullRequestPipeline, SECURITY_CYPRESS_SUITES } from '../kibana_pipeline';
import type { BuildkiteStep } from './client';

jest.mock('child_process', () => ({
  execFileSync: jest.fn(),
}));

import { getPipeline, flushCancelOnGateFailureMetadata, _resetPendingCancelKeys } from './utils';

const execFileSyncMock = execFileSync as jest.MockedFunction<typeof execFileSync>;

describe('getPipeline', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'buildkite-utils-'));
    execFileSyncMock.mockReset();
    _resetPendingCancelKeys();
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const writePipeline = (contents: string): string => {
    const filename = path.join(tempDir, 'pipeline.yml');
    fs.writeFileSync(filename, contents);
    return filename;
  };

  it('ignores comment-only steps when registering cancel-on-gate-failure metadata', () => {
    const filename = writePipeline(`steps:
#  - command: .buildkite/scripts/steps/checks/api_contracts.sh
#    key: check_api_contracts
`);

    expect(() => getPipeline(filename, { cancelOnGateFailure: true })).not.toThrow();
    expect(execFileSyncMock).not.toHaveBeenCalled();
  });

  it('ignores non-command steps when registering cancel-on-gate-failure metadata', () => {
    const filename = writePipeline(`steps:
  - wait: ~
`);

    expect(() => getPipeline(filename, { cancelOnGateFailure: true })).not.toThrow();
    expect(execFileSyncMock).not.toHaveBeenCalled();
  });

  it('registers metadata for keyed steps', () => {
    const filename = writePipeline(`steps:
  - command: echo test
    key: test_step
`);

    getPipeline(filename, { cancelOnGateFailure: true });
    flushCancelOnGateFailureMetadata();

    expect(execFileSyncMock).toHaveBeenCalledWith(
      'buildkite-agent',
      ['meta-data', 'set', 'cancel_on_gate_failure_batch:pipeline'],
      { input: JSON.stringify(['test_step']), stdio: ['pipe', 'inherit', 'inherit'] }
    );
  });

  it('still throws when an active step is missing a key', () => {
    const filename = writePipeline(`steps:
  - command: echo test
`);

    expect(() => getPipeline(filename, { cancelOnGateFailure: true })).toThrow(
      'is missing a "key"'
    );
  });

  it('accepts every cancelable pull request pipeline fragment', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const pullRequestPipelinePath = path.resolve(
      __dirname,
      '../../scripts/pipelines/pull_request/pipeline.ts'
    );
    const pipelineSource = fs.readFileSync(pullRequestPipelinePath, 'utf8');
    const cancelablePipelines = [
      ...new Set(
        [...pipelineSource.matchAll(/getPipeline\(\s*'([^']+\.yml)'\s*,\s*cancelable\s*\)/gs)].map(
          ([, filename]) => path.resolve(repoRoot, filename)
        )
      ),
    ];

    expect(cancelablePipelines.length).toBeGreaterThan(0);

    for (const filename of cancelablePipelines) {
      expect(() => getPipeline(filename, { cancelOnGateFailure: true })).not.toThrow();
    }
  });

  it('has no duplicate step keys across cancelable pipeline files and generated steps', () => {
    const repoRoot = path.resolve(__dirname, '../../..');
    const pullRequestPipelinePath = path.resolve(
      __dirname,
      '../../scripts/pipelines/pull_request/pipeline.ts'
    );
    const pipelineSource = fs.readFileSync(pullRequestPipelinePath, 'utf8');

    // Collect all cancelable pipeline files
    const cancelablePipelines = [
      ...new Set(
        [...pipelineSource.matchAll(/getPipeline\(\s*'([^']+\.yml)'\s*,\s*cancelable\s*\)/gs)].map(
          ([, filename]) => path.resolve(repoRoot, filename)
        )
      ),
    ];

    // These pipeline pairs are in if/else branches in pipeline.ts and can never
    // both be uploaded in the same build, so shared keys are safe.
    const mutuallyExclusivePairs = new Set([
      'build_project.yml:deploy_project.yml',
      'deploy_project.yml:build_project.yml',
    ]);

    const allKeys = new Map<string, string>();
    const duplicates: string[] = [];

    for (const filename of cancelablePipelines) {
      const doc = loadYaml(fs.readFileSync(filename, 'utf8'));
      if (!doc || !Array.isArray(doc.steps)) continue;

      const collectKeys = (steps: Array<Record<string, unknown>>) => {
        for (const step of steps) {
          if (typeof step !== 'object' || step === null) continue;
          if (typeof step.key === 'string') {
            const rel = path.relative(repoRoot, filename);
            if (allKeys.has(step.key as string)) {
              const existingFile = allKeys.get(step.key as string)!;
              const pair = `${path.basename(existingFile)}:${path.basename(rel)}`;
              if (!mutuallyExclusivePairs.has(pair)) {
                duplicates.push(`key "${step.key}" in ${rel} conflicts with ${existingFile}`);
              }
            } else {
              allKeys.set(step.key as string, rel);
            }
          }
          if (Array.isArray(step.steps)) {
            collectKeys(step.steps as Array<Record<string, unknown>>);
          }
        }
      };

      collectKeys(doc.steps);
    }

    // Also check the generated steps (pull_request/base.yml and the
    // security_solution fragment files were replaced by typed modules).
    const builderSource = 'pipeline-utils/kibana_pipeline (generated)';
    const generatedKeys = [
      ...pullRequestPipeline()
        .steps.filter(
          (s): s is BuildkiteStep & { key: string } =>
            typeof s === 'object' && s !== null && 'key' in s && typeof s.key === 'string'
        )
        .map((s) => s.key),
      // All cypress groups can be uploaded together (ci:all-cypress-suites).
      ...SECURITY_CYPRESS_SUITES.map((suite) => suite.prKey),
    ];
    for (const key of generatedKeys) {
      if (allKeys.has(key)) {
        duplicates.push(`key "${key}" in ${builderSource} conflicts with ${allKeys.get(key)}`);
      } else {
        allKeys.set(key, builderSource);
      }
    }

    expect(duplicates).toEqual([]);
  });
});
