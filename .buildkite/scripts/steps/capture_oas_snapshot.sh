#!/usr/bin/env bash

set -euo pipefail

source .buildkite/scripts/common/util.sh

echo --- Capture OAS snapshot
cmd="node scripts/capture_oas_snapshot --include-path /api/status --no-serverless"
if is_pr && ! is_auto_commit_disabled; then
  cmd="$cmd --update"
fi

if [[ $BUILDKITE_PULL_REQUEST != "false" && "$BUILDKITE_PULL_REQUEST_BASE_BRANCH" != "main" ]] || [[ $BUILDKITE_PULL_REQUEST == "false" && "$BUILDKITE_BRANCH" != "main" ]]; then
  cmd="$cmd --no-serverless"
fi

eval "$cmd"
check_for_changed_files "$cmd" true