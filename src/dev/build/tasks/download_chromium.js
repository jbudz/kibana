/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import { download, paths } from '@kbn/screenshotting-plugin/server/utils';

export const DownloadChromium = {
  description: 'Download Chromium',

  async run(config, log) {
    const preInstalledPackages = paths.packages.filter((p) => p.isPreInstalled);

    for (const platform of config.getNodePlatforms()) {
      const pkg = paths.find(platform.getName(), platform.getArchitecture(), preInstalledPackages);
      const target = `${platform.getName()}-${platform.getArchitecture()}`;

      if (!pkg) {
        log.info(`Skipping Chromium download for ${target}`);

        // Unbundled chromium packages (for Darwin): Chromium is downloaded at
        // server startup, rather than being pre-installed
        continue;
      }

      log.info(`Downloading Chromium for ${target}`);

      const logger = {
        get: log.withType.bind(log),
        debug: log.debug.bind(log),
        info: log.info.bind(log),
        warn: log.warning.bind(log),
        trace: log.verbose.bind(log),
        error: log.error.bind(log),
        fatal: log.error.bind(log),
        log: log.write.bind(log),
      };

      await download(pkg, logger);
    }
  },
};
