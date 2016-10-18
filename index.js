/* jshint node: true */
'use strict';
const browserifyTree = require('./lib/browserify-tree');

module.exports = {
  name: 'ember-pouch',
  treeForVendor(tree) {
    return browserifyTree(tree, {
      modules: [
        {
          module: 'pouchdb-browser',
          resolution: 'pouchdb'
        },
        'relational-pouch',
        'pouchdb-find'
      ],
      outputFile: 'pouchdb-browserify.js'
    });
  },
  included(app) {
    app.import('vendor/pouchdb-browserify.js');
  }
};
