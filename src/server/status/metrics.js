let { keysToSnakeCaseShallow } = require('../../utils/case_conversion');
let _ = require('lodash');

function collectMetrics(kbnServer, server, config) {
  let Samples = require('./Samples');
  let lastReport = Date.now();

  kbnServer.metrics = new Samples(12);

  server.plugins.good.monitor.on('ops', function (event) {
    let now = Date.now();
    let secSinceLast = (now - lastReport) / 1000;
    lastReport = now;

    let port = config.get('server.port');
    let requests = _.get(event, ['requests', port, 'total'], 0);
    let requestsPerSecond = requests / secSinceLast;

    kbnServer.v6Metrics = getV6Metrics({ event, config });
    kbnServer.metrics.add({
      heapTotal: _.get(event, 'psmem.heapTotal'),
      heapUsed: _.get(event, 'psmem.heapUsed'),
      load: event.osload,
      responseTimeAvg: _.get(event, ['responseTimes', port, 'avg']),
      responseTimeMax: _.get(event, ['responseTimes', port, 'max']),
      requestsPerSecond: requestsPerSecond
    });

  });
}

function getV6Metrics({ event, config }) {
  const port = config.get('server.port');
  const timestamp = new Date().toISOString();
  return {
    last_updated: timestamp,
    collection_interval_in_millis: 5000,
    uptime_in_millis: process.uptime() * 1000,
    process: {
      memory: {
        heap: {
          total_in_bytes: _.get(event, 'psmem.heapTotal'),
          used_in_bytes:  _.get(event, 'psmem.heapUsed')
        }
      }
    },
    os: {
      load: {
        '1m': _.get(event, 'osload.0'),
        '5m': _.get(event, 'osload.1'),
        '15m': _.get(event, 'osload.1')
      }
    },
    response_times: {
      average_in_millis:  _.get(event, ['responseTimes', port, 'avg']),
      max_in_millis: _.get(event, ['responseTimes', port, 'max'])
    },
    requests:  keysToSnakeCaseShallow(_.get(event, ['requests', port])),
    concurrent_connections: _.get(event, ['concurrents', port])
  };
}

module.exports = {
  collectMetrics,
  getV6Metrics
};
