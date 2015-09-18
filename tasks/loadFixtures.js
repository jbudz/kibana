var _ = require('lodash');
var wreck = require('wreck');
var fs = require('fs');
var path = require('path');
var colors = require('ansicolors');
var elasticsearch = require('elasticsearch');

module.exports = function (grunt) {
  grunt.registerTask('loadFixtures', 'Loads fixtures into elasticsearch', function () {
    const config = this.options();
    const done = this.async();
    const client = new elasticsearch.Client({
      host: config.server
    });
    const ignoredFileRegExp = /^_/;
    const jsExtensionRegExp = /(.js)/;

    function ignoredFile(file) {
      return !file.match(ignoredFileRegExp);
    }

    function getIndexName(file) {
      return file.replace(jsExtensionRegExp, '');
    }

    const indexFiles = fs.readdirSync(config.indicesDir).filter(ignoredFile);
    const bulkFiles = fs.readdirSync(config.bulkDir).filter(ignoredFile);

    Promise.all(indexFiles
      .map(function createIndex(file) {
      return client.indices.create({
        index: getIndexName(file),
        body: require(path.join(config.indicesDir, file))
      });
    }))
    .then(function createIndexDone(res) {
      grunt.log.writeln(`[${colors.green('success')}][indices] ${indexFiles.join(', ')}`);
    })
    .then(function loadBulkData() {
      return Promise.all(bulkFiles.map(function bulk(file) {
        return client.bulk({
          body: require(path.join(config.bulkDir, file)),
        });
      }));
    })
    .then(function bulkDone(res) {
      grunt.log.writeln(`[${colors.green('success')}][bulk] ${bulkFiles.join(', ')}`);
    })
    .then(done)
    .catch(function error(e) {
      grunt.fail.warn(e);
    });
  });
};
