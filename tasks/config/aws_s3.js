export default function (grunt) {
  const { sha, version } = grunt.config.get('build');
  const BUILD_NUMBER = process.env.BUILD_NUMBER;

  return {
    options: {
      bucket: 'download.elasticsearch.org',
      access: 'private',
      uploadConcurrency: 10
    },

    staging: {
      files: [{
        expand: true,
        cwd: 'target',
        src: ['**'],
        dest: `kibana/staging/${version}-${sha.substr(0, 7)}/kibana/`
      }]
    },
    screenshots: {
      bucket: 'kibana-screenshots.elastic.co',
      region: 'us-east-1',
      files: [{
        expand: true,
        cwd: 'test/functional/screenshots',
        src: ['**'],

        //TODO: this needs to be the jenkins build number
        dest: `kibana-${version}/${BUILD_NUMBER}/`
      }]
    }
  };
}
