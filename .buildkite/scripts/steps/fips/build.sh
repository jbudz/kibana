#!/usr/bin/env bash

set -euo pipefail

.buildkite/scripts/bootstrap.sh

source .buildkite/scripts/common/util.sh
source .buildkite/scripts/steps/artifacts/env.sh

echo "$KIBANA_DOCKER_PASSWORD" | docker login -u "$KIBANA_DOCKER_USERNAME" --password-stdin docker.elastic.co
mkdir -p target
download_artifact "kibana-$FULL_VERSION-linux-x86_64.tar.gz" ./target --build "${KIBANA_BUILD_ID:-$BUILDKITE_BUILD_ID}"

echo "--- Build FIPS image"
node scripts/build \
    --skip-initialize \
    --skip-generic-folders \
    --skip-platform-folders \
    --skip-cdn-assets \
    --skip-archives \
    --docker-images \
    --docker-namespace="kibana-ci" \
    --docker-tag-qualifier="$BUILDKITE_COMMIT" \
    --docker-push \
    --skip-docker-ubi \
    --skip-docker-ubuntu \
    --skip-docker-cloud \
    --skip-docker-serverless \
    --skip-docker-contexts

docker logout docker.elastic.co

# Moving to `target/` first will keep `buildkite-agent` from including directories in the artifact name
cd "$KIBANA_DIR/target"
buildkite-agent artifact upload "./*docker-image*.tar.gz"
