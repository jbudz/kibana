/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import pluginHelpers from '@kbn/plugin-helpers';
import gulp from 'gulp';

import { getEnabledPlugins } from './helpers/flags';

export const testKarmaTask = async () => {
  const plugins = await getEnabledPlugins();
  await pluginHelpers.run('testKarma', {
    plugins: plugins.join(','),
  });
};

export const testKarmaDebugTask = async () => {
  const plugins = await getEnabledPlugins();
  await pluginHelpers.run('testKarma', {
    dev: true,
    plugins: plugins.join(','),
  });
};

export const testTask = gulp.series(testKarmaTask, testKarmaDebugTask);
