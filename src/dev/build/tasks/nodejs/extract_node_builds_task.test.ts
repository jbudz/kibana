/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { readFileSync } from 'fs';
import Path from 'path';

import { REPO_ROOT } from '@kbn/repo-info';
import { ToolingLog, ToolingLogCollectingWriter } from '@kbn/tooling-log';
import { createAbsolutePathSerializer, createRecursiveSerializer } from '@kbn/jest-serializers';

import { Config } from '../../lib';
import { ExtractNodeBuilds } from './extract_node_builds_task';

jest.mock('../../lib/fs');
jest.mock('../../lib/get_build_number');

const Fs = jest.requireMock('../../lib/fs');

const log = new ToolingLog();
const testWriter = new ToolingLogCollectingWriter();
log.setWriters([testWriter]);

expect.addSnapshotSerializer(createAbsolutePathSerializer());

const nodeVersion = readFileSync(Path.resolve(REPO_ROOT, '.node-version'), 'utf8').trim();
expect.addSnapshotSerializer(
  createRecursiveSerializer(
    (s) => typeof s === 'string' && s.includes(nodeVersion),
    (s) => s.split(nodeVersion).join('<node version>')
  )
);

async function setup() {
  const config = await Config.create({
    isRelease: true,
    targetAllPlatforms: true,
    targetServerlessPlatforms: false,
    dockerContextUseLocalArtifact: false,
    dockerCrossCompile: false,
    dockerNamespace: null,
    dockerPush: false,
    dockerTag: '',
    dockerTagQualifier: '',
    downloadFreshNode: true,
    withExamplePlugins: false,
    withTestPlugins: true,
  });

  return { config };
}

beforeEach(() => {
  testWriter.messages.length = 0;
  jest.clearAllMocks();
});

it('runs expected fs operations', async () => {
  const { config } = await setup();

  await ExtractNodeBuilds.run(config, log, []);

  const usedMethods = Object.fromEntries(
    Object.entries(Fs)
      .filter((entry): entry is [string, jest.Mock] => {
        const [, mock] = entry;

        if (typeof mock !== 'function') {
          return false;
        }

        return (mock as jest.Mock).mock.calls.length > 0;
      })
      .map(([name, mock]) => [name, mock.mock.calls])
  );

  expect(usedMethods).toMatchInlineSnapshot(`
    Object {
      "copy": Array [
        Array [
          <absolute path>/.node_binaries/<node version>/default/win32-x64/node.exe,
          <absolute path>/.node_binaries/<node version>/default/win32-x64/node.exe,
          Object {
            "clone": true,
          },
        ],
        Array [
          <absolute path>/.node_binaries/<node version>/default/win32-arm64/node.exe,
          <absolute path>/.node_binaries/<node version>/default/win32-arm64/node.exe,
          Object {
            "clone": true,
          },
        ],
      ],
      "untar": Array [
        Array [
          <absolute path>/.node_binaries/<node version>/glibc-217/linux-x64/node-v<node version>-linux-x64.tar.gz,
          <absolute path>/.node_binaries/<node version>/glibc-217/linux-x64,
          Object {
            "strip": 1,
          },
        ],
        Array [
          <absolute path>/.node_binaries/<node version>/glibc-217/linux-arm64/node-v<node version>-linux-arm64.tar.gz,
          <absolute path>/.node_binaries/<node version>/glibc-217/linux-arm64,
          Object {
            "strip": 1,
          },
        ],
        Array [
          <absolute path>/.node_binaries/<node version>/default/darwin-x64/node-v<node version>-darwin-x64.tar.gz,
          <absolute path>/.node_binaries/<node version>/default/darwin-x64,
          Object {
            "strip": 1,
          },
        ],
        Array [
          <absolute path>/.node_binaries/<node version>/default/darwin-arm64/node-v<node version>-darwin-arm64.tar.gz,
          <absolute path>/.node_binaries/<node version>/default/darwin-arm64,
          Object {
            "strip": 1,
          },
        ],
        Array [
          <absolute path>/.node_binaries/<node version>/glibc-217/linux-x64/node-v<node version>-linux-x64.tar.gz,
          <absolute path>/.node_binaries/<node version>/glibc-217/linux-x64,
          Object {
            "strip": 1,
          },
        ],
        Array [
          <absolute path>/.node_binaries/<node version>/pointer-compression/linux-x64/node-v<node version>-linux-x64.tar.gz,
          <absolute path>/.node_binaries/<node version>/pointer-compression/linux-x64,
          Object {
            "strip": 1,
          },
        ],
        Array [
          <absolute path>/.node_binaries/<node version>/glibc-217/linux-arm64/node-v<node version>-linux-arm64.tar.gz,
          <absolute path>/.node_binaries/<node version>/glibc-217/linux-arm64,
          Object {
            "strip": 1,
          },
        ],
        Array [
          <absolute path>/.node_binaries/<node version>/pointer-compression/linux-arm64/node-v<node version>-linux-arm64.tar.gz,
          <absolute path>/.node_binaries/<node version>/pointer-compression/linux-arm64,
          Object {
            "strip": 1,
          },
        ],
      ],
    }
  `);
});
