import wrapAuthConfig from './wrap_auth_config';
import os from 'os';

module.exports = function (kbnServer, server, config) {
  let _ = require('lodash');
  let ServerStatus = require('./ServerStatus');
  var { join } = require('path');

  kbnServer.status = new ServerStatus(kbnServer.server);

  if (server.plugins.good) {
    kbnServer.mixin(require('./metrics').collectMetrics);
  }

  const wrapAuth = wrapAuthConfig(config.get('status.allowAnonymous'));
  const matchSnapshot = /-SNAPSHOT$/;
  server.route(wrapAuth({
    method: 'GET',
    path: '/api/status',
    handler: function (request, reply) {
      const v6Format = 'v6' in request.query;
      if (v6Format) {
        return reply({
          name: os.hostname(),
          version: {
            number: config.get('pkg.version').replace(matchSnapshot, ''),
            build_hash: config.get('pkg.buildSha'),
            build_number: config.get('pkg.buildNum'),
            build_snapshot: matchSnapshot.test(config.get('pkg.version'))
          },
          status: kbnServer.status.toJSON(),
          metrics: kbnServer.v6Metrics
        });
      }

      return reply({
        status: kbnServer.status.toJSON(),
        metrics: kbnServer.metrics
      });
    }
  }));

  server.decorate('reply', 'renderStatusPage', function () {
    let app = kbnServer.uiExports.getHiddenApp('statusPage');
    let resp = app ? this.renderApp(app) : this(kbnServer.status.toString());
    resp.code(kbnServer.status.isGreen() ? 200 : 503);
    return resp;
  });

  server.route(wrapAuth({
    method: 'GET',
    path: '/status',
    handler: function (request, reply) {
      return reply.renderStatusPage();
    }
  }));
};
