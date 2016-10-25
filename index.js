/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-pouch',
  included(app) {
    const bowerDir = app.bowerDirectory;

    app.import(bowerDir + '/pouchdb/dist/pouchdb.js');
    app.import(bowerDir + '/relational-pouch/dist/pouchdb.relational-pouch.js');
    app.import(bowerDir + '/pouchdb-find/dist/pouchdb.find.js');
    app.import('vendor/shims/pouchdb.js', {
      exports: { 'pouchdb': [ 'default' ]}
    });
  },
  
  isDevelopingAddon: function() {
  	return true;
  }
};
