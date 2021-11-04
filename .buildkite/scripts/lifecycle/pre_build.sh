#!/usr/bin/env bash

set -euo pipefail

source .buildkite/scripts/common/util.sh

"$(dirname "${0}")/commit_status_start.sh"

export CI_STATS_TOKEN="$(retry 5 5 vault read -field=api_token secret/kibana-issues/dev/kibana_ci_stats)"
export CI_STATS_HOST="$(retry 5 5 vault read -field=api_host secret/kibana-issues/dev/kibana_ci_stats)"

DOCKER_USERNAME="$(retry 5 5 vault read -field=username secret/kibana-issues/dev/container-registry)"
DOCKER_PASSWORD="$(retry 5 5 vault read -field=password secret/kibana-issues/dev/container-registry)"
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin docker.elastic.co
unset DOCKER_USERNAME
unset DOCKER_PASSWORD

DOCKER_STAGING_USERNAME="$(retry 5 5 vault read -field=username secret/kibana-issues/dev/container-registry-staging)"
DOCKER_STAGING_PASSWORD="$(retry 5 5 vault read -field=password secret/kibana-issues/dev/container-registry-staging)"
echo "$DOCKER_STAGING_PASSWORD" | docker login -u "$DOCKER_STAGING_USERNAME" --password-stdin container-registry-test.elastic.co
unset DOCKER_STAGING_USERNAME
unset DOCKER_STAGING_PASSWORD

node "$(dirname "${0}")/ci_stats_start.js"
