var distes6 = require('broccoli-dist-es6-module');

module.exports = distes6('lib', {

  // the entry script, and module that becomes the global
  main: 'hal-adapter',

  // will become window.DS.HALAdapter with the exports from `main`
  global: 'DS.HALAdapter',

  // the prefix for named-amd modules
  packageName: 'hal-adapter',

  // global output only: naive shimming, when the id 'ember' is imported,
  // substitute with `window.Ember` instead
  shim: {
    'ember': 'Ember'
  }
});
