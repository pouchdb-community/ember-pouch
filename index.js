/* jshint node: true */
'use strict';

var path = require('path');
var stew = require('broccoli-stew');

module.exports = {
  name: 'ember-pouch',

  treeForVendor: function() {
    var pouchdb = stew.find(path.join(path.dirname(require.resolve('pouchdb')), '..', 'dist'), {
      destDir: 'pouchdb',
      files: ['pouchdb.js']
    });

    var relationalPouch = stew.find(path.join(path.dirname(require.resolve('relational-pouch')), '..', 'dist'), {
      destDir: 'pouchdb',
      files: ['pouchdb.relational-pouch.js']
    });

    var pouchdbFind = stew.find(path.join(path.dirname(require.resolve('pouchdb-find')), '..', 'dist'), {
      destDir: 'pouchdb',
      files: ['pouchdb.find.js']
    });

    var shims = stew.find(__dirname + '/vendor/pouchdb', {
      destDir: 'pouchdb',
      files: ['shims.js']
    });

    return stew.find([
      pouchdb,
      relationalPouch,
      pouchdbFind,
      shims
    ]);
  },

  included(app) {
    app.import('vendor/pouchdb/pouchdb.js');
    app.import('vendor/pouchdb/pouchdb.relational-pouch.js');
    app.import('vendor/pouchdb/pouchdb.find.js');
    app.import('vendor/pouchdb/shims.js', {
      exports: { 'pouchdb': [ 'default' ]}
    });
  }
};
