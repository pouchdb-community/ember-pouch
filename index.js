/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-pouch',

  included: function included(app) {
    var bowerDir = app.bowerDirectory;

    app.import(bowerDir + '/pouchdb/dist/pouchdb.js');
    app.import(bowerDir + '/relational-pouch/dist/pouchdb.relational-pouch.js');
    app.import('vendor/ember-pouch/shim.js', {
      type: 'vendor',
      exports: {
        'pouchdb': [ 'default' ]
      }
    });
  }
};