import { flatten } from 'lodash';
import { join } from 'path';

import exec from '../utils/exec';

module.exports = function (grunt) {
  grunt.registerTask('build', 'Build packages', function () {
    grunt.task.run(flatten([
      'clean:build',
      'clean:target',
      '_build:downloadNodeBuilds',
      '_build:extractNodeBuilds',
      'copy:devSource',
      'copy:config',
      'clean:devSourceForTestbed',
      'babel:build',
      '_build:babelOptions',
      '_build:plugins',
      '_build:data',
      '_build:verifyTranslations',
      '_build:packageJson',
      '_build:readme',
      '_build:babelCache',
      '_build:installNpmDeps',
      '_build:notice',
      '_build:removePkgJsonDeps',
      'clean:testsFromModules',
      'run:optimizeBuild',
      'stop:optimizeBuild',
      '_build:versionedLinks',
      '_build:osShellScripts',
      grunt.option('skip-archives') ? [] : ['_build:archives'],
      grunt.option('skip-os-packages') ? [] : [
        '_build:pleaseRun',
        '_build:osPackages',
      ],
      '_build:shasums'
    ]));
  });

  grunt.registerTask('build:docker', 'Build packages from a container', function () {
    const composePath = join(grunt.config.get('root'), 'tasks/build/docker/docker-compose.yml');
    const env = Object.assign(process.env, {
      KIBANA_NODE_VERSION:  grunt.config.get('nodeVersion'),
      KIBANA_BUILD_CONTEXT: grunt.config.get('root'),
      KIBANA_BUILD_OPTIONS: grunt.option.flags().join(' ')
    });

    const useCache = grunt.option('cache');

    exec('docker-compose', [
      '-f', composePath,
      'build',
      useCache ? '' : '--no-cache',
    ].filter(Boolean), { env });
    exec('docker-compose', [
      '-f', composePath,
      'up'
    ], { env });
  });
};
