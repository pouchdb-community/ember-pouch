var distes6 = require('broccoli-dist-es6-module');

module.exports = distes6('lib', {

  // the entry script, and module that becomes the global
  main: 'index',

  // will become window.HAL with the exports from `main`
  global: 'HAL',

  // the prefix for named-amd modules
  packageName: 'hal-adapter',

  // global output only: naive shimming, when the id 'ember' is imported,
  // substitute with `window.Ember` instead
  shim: {
    'ember': 'Ember'
  }
});
