#!/bin/bash
set -euo pipefail

ts-node .buildkite/scripts/pipelines/emit_pipeline.ts merge_queue
