import { resolve } from 'path';
import exec from '../utils/exec';

export default (grunt) => {
  const { config } = grunt;
  const targetDir = config.get('target');
  const rootDir = grunt.config.get('root');
  const staticBuildDir = resolve(rootDir, '/tasks/build');
  const packageScriptsDir = resolve(rootDir, '/tasks/build/package_scripts');
  const packages = config.get('packages');
  const fpm = args => exec('fpm', args);

  grunt.registerTask('_build:osPackages', function () {
    grunt.file.mkdir(targetDir);

    config.get('platforms')
      .filter(({ name }) => /linux-x86_64$/.test(name))
      .forEach(({ buildDir: kibanaBuildDir, debArch, rpmArch }) => {
        const baseOptions = [
          '--force',
          // we force dashes in the version file name because otherwise fpm uses
          // the filtered package version, which would have dashes replaced with
          // underscores
          '--package', `${targetDir}/NAME-${packages.version}-ARCH.TYPE`,
          '-s', 'dir', // input type
          '--name', packages.name,
          '--description', packages.description,
          '--version', packages.version,
          '--url', packages.site,
          '--vendor', packages.vendor,
          '--maintainer', packages.maintainer,
          '--license', packages.license,
          '--after-install', resolve(packageScriptsDir, 'post_install.sh'),
          '--before-install', resolve(packageScriptsDir, 'pre_install.sh'),
          '--before-remove', resolve(packageScriptsDir, 'pre_remove.sh'),
          '--after-remove', resolve(packageScriptsDir, 'post_remove.sh'),
          '--config-files', packages.path.kibanaConfig,
          '--template-value', `user=${packages.user}`,
          '--template-value', `group=${packages.group}`,
          '--template-value', `optimizeDir=${packages.path.home}/optimize`,
          '--template-value', `configDir=${packages.path.conf}`,
          '--template-value', `pluginsDir=${packages.path.plugins}`,
          '--template-value', `dataDir=${packages.path.data}`,
          //config folder is moved to path.conf, exclude {path.home}/config
          //uses relative path to --prefix, strip the leading /
          '--exclude', `${packages.path.home.slice(1)}/config`,
          '--exclude', `${packages.path.home.slice(1)}/data`
        ];
        const debOptions = [
          '-t', 'deb',
          '--architecture', debArch,
          '--deb-priority', 'optional'
        ];
        const rpmOptions = [
          '-t', 'rpm',
          '--architecture', rpmArch,
          '--rpm-os', 'linux'
        ];
        const args = [
          `${kibanaBuildDir}/=${packages.path.home}/`,
          `${kibanaBuildDir}/data/=${packages.path.data}/`,
          `${staticBuildDir}/config/=${packages.path.conf}/`,
          `${staticBuildDir}/services/etc/=/etc/`
          `${staticBuildDir}/services/usr/=/usr/`
        ];

        //Manually find flags, multiple args without assignment are not entirely parsed
        const flags = grunt.option.flags().filter(flag => /deb|rpm/.test(flag)).join(',');
        const buildDeb = flags.includes('deb') || !flags.length;
        const buildRpm = flags.includes('rpm') || !flags.length;
        if (buildDeb) {
          fpm([...baseOptions, ...debOptions, ...args]);
        }
        if (buildRpm) {
          fpm([...baseOptions, ...rpmOptions, ...args]);
        }

      });
  });
};
