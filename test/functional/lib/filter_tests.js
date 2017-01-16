module.exports = function (tests) {
  const requestedApps = process.argv.reduce((previous, arg) => {
    const option = arg.split('=');
    const key = option[0];
    const value = option[1];
    if (key === 'appSuites' && value) return value.split(',');
  });

  return tests.filter((suite) => {
    if (!requestedApps) return true;
    return requestedApps.reduce((previous, app) => {
      return previous || ~suite.indexOf(app);
    }, false);
  });
};
