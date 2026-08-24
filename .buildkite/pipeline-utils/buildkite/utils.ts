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
import { parse as loadYaml, stringify } from 'yaml';
import type { BuildkiteAgentTargetingRule, BuildkiteStep } from './client';

export interface EmitPipelineDocument {
  env?: Record<string, string | number>;
  agents?: BuildkiteAgentTargetingRule;
  steps: BuildkiteStep[];
}

/** Emits a pipeline by writing to stdout, which Buildkite picks up as the pipeline upload. */
export function emitPipeline(pipelineSteps: string[], debug?: boolean): void;
export function emitPipeline(doc: EmitPipelineDocument): void;
export function emitPipeline(arg: string[] | EmitPipelineDocument, debug = false): void {
  if (Array.isArray(arg)) {
    const pipelineStr = [...new Set(arg)].join('\n');
    if (debug) {
      console.warn('Emitting pipeline:\n', pipelineStr);
    }
    console.log(pipelineStr);
  } else {
    console.log(stringify(arg));
  }
}

export interface GetPipelineOptions {
  removeSteps?: boolean;
  cancelOnGateFailure?: boolean;
}

function isObj(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

function isCommandStep(step: Record<string, unknown>): step is Record<string, unknown> & {
  command: string;
} {
  return typeof step.command === 'string';
}

function getSteps(filename: string, doc: unknown): unknown[] {
  if (!isObj(doc)) {
    throw new Error(`${filename}: expected a YAML document with a "steps" array`);
  }

  if (doc.steps == null) {
    return [];
  }

  if (!Array.isArray(doc.steps)) {
    throw new Error(`${filename}: expected a YAML document with a "steps" array`);
  }

  return doc.steps;
}

/**
 * Extracts cancelable step keys from a parsed pipeline YAML document.
 * For group steps, recurses into child steps instead of registering the
 * group key (buildkite-agent step cancel does not work on group keys).
 * Throws if any command step is missing a key.
 */
function extractStepKeys(filename: string, doc: unknown): string[] {
  const keys: string[] = [];
  const steps = getSteps(filename, doc);

  for (const step of steps) {
    if (!isObj(step)) continue;

    // Group step: recurse into child steps instead of registering the group key
    if (typeof step.group === 'string' && Array.isArray(step.steps)) {
      for (const child of step.steps) {
        if (!isObj(child)) continue;

        if (!isCommandStep(child)) {
          continue;
        }

        if (typeof child.key === 'string') {
          keys.push(child.key);
        } else {
          const label = String(child.label ?? child.command ?? 'unknown');
          throw new Error(
            `${filename}: group "${step.group}" child step "${label}" is missing a "key" (required for cancelOnGateFailure)`
          );
        }
      }
      continue;
    }

    if (!isCommandStep(step)) {
      continue;
    }

    if (typeof step.key === 'string') {
      keys.push(step.key);
    } else {
      const label = String(step.label ?? step.group ?? step.command ?? 'unknown');
      throw new Error(
        `${filename}: step "${label}" is missing a "key" (required for cancelOnGateFailure)`
      );
    }
  }

  return keys;
}

const pendingCancelKeys: string[] = [];

function registerCancelOnGateFailureMetadata(keys: string[]) {
  pendingCancelKeys.push(...keys);
}

export function registerCancelKeys(keys: string[]) {
  pendingCancelKeys.push(...keys);
}

export function flushCancelOnGateFailureMetadata() {
  if (pendingCancelKeys.length === 0) return;
  execFileSync('buildkite-agent', ['meta-data', 'set', 'cancel_on_gate_failure_batch:pipeline'], {
    input: JSON.stringify(pendingCancelKeys),
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  pendingCancelKeys.length = 0;
}

/** @internal Exposed only for tests */
export function _resetPendingCancelKeys() {
  pendingCancelKeys.length = 0;
}

export const getPipeline = (filename: string, options?: boolean | GetPipelineOptions) => {
  const opts: GetPipelineOptions =
    typeof options === 'boolean' ? { removeSteps: options } : { removeSteps: true, ...options };

  const str = fs.readFileSync(filename).toString();

  if (opts.cancelOnGateFailure) {
    const doc = loadYaml(str);
    const keys = extractStepKeys(filename, doc);
    registerCancelOnGateFailureMetadata(keys);
  }

  return opts.removeSteps ? str.replace(/^steps:/, '') : str;
};

// Renders steps as a YAML fragment (no `steps:` header) for composition with getPipeline() fragments.
export const getPipelineFromSteps = (
  steps: BuildkiteStep[],
  options?: Pick<GetPipelineOptions, 'cancelOnGateFailure'>
): string => {
  if (steps.length === 0) {
    return '';
  }

  if (options?.cancelOnGateFailure) {
    registerCancelOnGateFailureMetadata(extractStepKeys('generated steps', { steps }));
  }

  return stringify({ steps }).replace(/^steps:\n/, '');
};
