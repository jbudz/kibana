/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import dedent from 'dedent';

import { TemplateContext } from '../template_context';

function generator({
  imageTag,
  imageFlavor,
  dockerPush,
  dockerTagQualifier,
  version,
  dockerTargetFilename,
  baseOSImage,
  architecture,
}: TemplateContext) {
  return dedent(`
  #!/usr/bin/env bash
  #
  # ** THIS IS AN AUTO-GENERATED FILE **
  #
  set -euo pipefail

  retry_docker_pull() {
    image=$1
    attempt=0
    max_retries=5

    while true
    do
      attempt=$((attempt+1))

      if [ $attempt -gt $max_retries ]
      then
        echo "Docker pull retries exceeded, aborting."
        exit 1
      fi

      if docker pull "$image"
      then
        echo "Docker pull successful."
        break
      else
        echo "Docker pull unsuccessful, attempt '$attempt'."
      fi

    done
  }

  retry_docker_pull ${baseOSImage}

  echo "Building: kibana${imageFlavor}-docker"; \\
  docker build -t ${imageTag}${imageFlavor}:${version}${dockerTagQualifier} -f Dockerfile . || exit 1;

  docker save ${imageTag}${imageFlavor}:${version}${dockerTagQualifier} | gzip -c > ${dockerTargetFilename}

  echo "Pushing: ${imageTag}${imageFlavor}:${version}${dockerTagQualifier}"; \\
  ${dockerPush} && docker image push ${imageTag}${imageFlavor}:${version}${dockerTagQualifier} || exit 1;
  exit 0
  `);
}

export const buildDockerSHTemplate = {
  name: 'build_docker.sh',
  generator,
};
