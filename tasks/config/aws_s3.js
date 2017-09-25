export default function (grunt) {
  const { sha, version } = grunt.config.get('build');
  const versionSha = `${version}-${sha.substr(0, 7)}`;

  const ciOptions = {
    bucket: 'kibana-ci-artifacts',
    region: 'us-west-2'
  };

  return {
    options: {
      access: 'private',
      uploadConcurrency: 10
    },

    staging: {
      options: {
        bucket: 'download.elasticsearch.org',
      },
      files: [{
        expand: true,
        cwd: 'target',
        src: ['**'],
        dest: `kibana/staging/${versionSha}/kibana/`
      }]
    },
    'ci_screenshots': {
      options: ciOptions,
      files: [{
        expand: true,
        cwd: 'test/functional/screenshots',
        src: ['**'],
        dest: `kibana/${versionSha}/screenshots/`
      }]
    },
    'ci_packages': {
      options: ciOptions,
      files:[{
        expand: true,
        cwd: 'target',
        src: ['**'],
        dest: `kibana/${versionSha}/packages/`
      }]
    },
    'ci_docs': {
      options: ciOptions,
      files:[{
        expand: true,
        cwd: 'html_docs',
        src: ['**'],
        dest: `kibana/${versionSha}/html_docs/`
      }]
    }
  };
}
