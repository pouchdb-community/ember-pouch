/* eslint-env node */
'use strict';

module.exports = function(environment /*, appConfig */) {
  const ENV = {
    APP: {},
  };
  if (environment === 'test') {
    ENV.APP.autoboot = false;
  }

  return ENV;
};
