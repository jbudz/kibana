import {
  bdd,
} from '../../../support';

import PageObjects from '../../../support/page_objects';

const expect = require('expect.js');

bdd.describe('tribe', function () {
  bdd.before(function () {
  });

  bdd.it('should not show dev tools in kibana', function () {

    return PageObjects.common.navigateToApp('management', false)
    .then(() => PageObjects.common.findAllTestSubjects('appLink'))
    .then(links => {
      return Promise.all(links.map(link => {
        return link.getVisibleText();
      }));
    })
    .then(function (links) {
      expect(links).not.to.contain('Dev Tools');
    })
    .catch(() => PageObjects.common.createErrorHandler(this));
  });

  bdd.it('should not show dev tools outside kibana', function () {
    return PageObjects.common.navigateToApp('timelion', false)
    .then(() => PageObjects.common.findAllTestSubjects('appLink'))
    .then(links => {
      return Promise.all(links.map(link => {
        return link.getVisibleText();
      }));
    })
    .then(function (links) {
      expect(links).not.to.contain('Dev Tools');
    })
    .catch(() => PageObjects.common.createErrorHandler(this));
  });
});
