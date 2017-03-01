import _ from 'lodash';
import processFunctionDefinition from './server/lib/process_function_definition';
import mappings from './mappings.json';

module.exports = function (server) {
  //var config = server.config();
  server.plugins.elasticsearch.registerMappings(mappings);
  require('./server/routes/run.js')(server);
  require('./server/routes/functions.js')(server);
  require('./server/routes/validate_es.js')(server);

  const functions = require('./server/lib/load_functions')('series_functions');

  function addFunction(func) {
    _.assign(functions, processFunctionDefinition(func));
  }

  function getFunction(name) {
    if (!functions[name]) throw new Error ('No such function: ' + name);
    return functions[name];
  }

  server.plugins.timelion = {
    functions: functions,
    addFunction: addFunction,
    getFunction: getFunction
  };


};
