'use strict'; // eslint-disable-line

define(function (require) {
  require('intern/dojo/node!../../support/env_setup');
  const filterTests = require('intern/dojo/node!../lib/filter_tests');
  const bdd = require('intern!bdd');
  const intern = require('intern');

  global.__kibana__intern__ = { intern, bdd };

  bdd.describe('kibana', function () {
    let PageObjects;
    let support;

    bdd.before(function () {
      PageObjects.init(this.remote);
      support.init(this.remote);
    });
    const supportPages = [
      'intern/dojo/node!../../support/page_objects',
      'intern/dojo/node!../../support'
    ];

    const apps = filterTests([
      'intern/dojo/node!./xpack',
      'intern/dojo/node!./discover',
      'intern/dojo/node!./management',
      'intern/dojo/node!./visualize',
      'intern/dojo/node!./console',
      'intern/dojo/node!./dashboard',
      'intern/dojo/node!./status_page'
    ]);

    require(supportPages.concat(apps), (loadedPageObjects, loadedSupport) => {
      PageObjects = loadedPageObjects;
      support = loadedSupport;
    });
  });
});
