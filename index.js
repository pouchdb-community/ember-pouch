/* jshint node: true */
'use strict';

var VersionChecker = require('ember-cli-version-checker');

// We support Ember-Data 1.13.x and 2.x. Checking for this is complicated
// because the effective version of ember-data is controlled by bower for
// 1.13.0-2.2.x and npm for 2.3.x. This gets as close as we can get using
// ember-cli-version-checker.
function satisfactoryEmberDataVersion(addon) {
  var checker = new VersionChecker(addon),
      bowerEmberData = checker.for('ember-data', 'bower'),
      npmEmberData = checker.for('ember-data', 'npm');
  return npmEmberData.isAbove('2.2.99') || bowerEmberData.isAbove('1.12.99');
}

module.exports = {
  name: 'ember-pouch',

  init: function () {
    if (!satisfactoryEmberDataVersion(this)) {
      var error = new Error("ember-pouch requires ember-data 1.13.x or 2.x");
      error.suppressStacktrace = true;
      throw error;
    }
  },

  included: function included(app) {
    var bowerDir = app.bowerDirectory;

    app.import(bowerDir + '/pouchdb/dist/pouchdb.js');
    app.import(bowerDir + '/relational-pouch/dist/pouchdb.relational-pouch.js');
    app.import(bowerDir + '/pouchdb-find/dist/pouchdb.find.js');
    app.import('vendor/ember-pouch/shim.js', {
      type: 'vendor',
      exports: {
        'pouchdb': [ 'default' ]
      }
    });
  }
};
