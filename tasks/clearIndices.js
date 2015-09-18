var elasticsearch = require('elasticsearch');

module.exports = function (grunt) {
  grunt.registerTask('clearIndices', 'Wipe elasticsearch indices', function () {
    const config = this.options();
    const done = this.async();
    const client = new elasticsearch.Client({
      host: config.server
    });

    client.indices.delete({
      index: '*'
    })
    .then(done)
    .catch(function error(e) {
      grunt.fail.warn(e);
    });
  });
};
