var path = require('path');


module.exports = function (grunt) {
  return {
    options: {
      server: 'http://localhost:9220',
      bulkDir: path.join(grunt.config.get('root'), 'test/fixtures/bulk'),
      indicesDir: path.join(grunt.config.get('root'), 'test/fixtures/indices')
    }
  };
};
