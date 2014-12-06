/* jshint node: true */
'use strict';
var path = require('path');

module.exports = {
  name: 'ember-pouch',

  included: function included(app) {
    this.app = app;

    app.import(app.bowerDirectory + '/pouchdb/dist/pouchdb.js');
    app.import(app.bowerDirectory + '/relational-pouch/dist/pouchdb.relational-pouch.js');
    app.import('vendor/ember-pouch/shim.js', {
      type: 'vendor',
      exports: {
        'pouchdb': [ 'default' ]
      }
    });
  },

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  }
};
