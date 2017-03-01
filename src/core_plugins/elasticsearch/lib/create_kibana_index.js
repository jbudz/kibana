import { getMappings } from './kibana_index_mappings';

module.exports = function (server) {
  const { callWithInternalUser } = server.plugins.elasticsearch.getCluster('admin');
  const index = server.config().get('kibana.index');

  return callWithInternalUser('indices.create', {
    index: index,
    body: {
      settings: {
        number_of_shards: 1,
        'index.mapper.dynamic': false,
      },
      mappings: getMappings()
    }
  })
  .catch(() => {
    throw new Error(`Unable to create Kibana index "${index}"`);
  })
  .then(function () {
    return callWithInternalUser('cluster.health', {
      waitForStatus: 'yellow',
      index: index
    })
    .catch(() => {
      throw new Error(`Waiting for Kibana index "${index}" to come online failed.`);
    });
  });
};
