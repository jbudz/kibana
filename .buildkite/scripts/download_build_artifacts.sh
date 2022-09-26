#!/usr/bin/env bash

set -euo pipefail

source "$(dirname "$0")/common/util.sh"

if [[ ! -d "$KIBANA_BUILD_LOCATION/bin" ]]; then
  echo '--- Downloading Distribution and Plugin artifacts'

  cd "$WORKSPACE"

  download_artifact kibana-default.tar.gz . --build "${KIBANA_BUILD_ID:-$BUILDKITE_BUILD_ID}"
  download_artifact kibana-default-plugins.tar.gz . --build "${KIBANA_BUILD_ID:-$BUILDKITE_BUILD_ID}"

  mkdir -p "$KIBANA_BUILD_LOCATION"
  tar -xzf kibana-default.tar.gz -C "$KIBANA_BUILD_LOCATION" --strip=1

  cd "$KIBANA_DIR"

  # Testing against an example plugin distribution is not supported,
  # mostly due to snapshot failures when testing UI element lists
  if is_pr_with_label "ci:build-example-plugins"; then
    rm -rf 'plugins/*'
  fi

  tar -xzf ../kibana-default-plugins.tar.gz
fi
