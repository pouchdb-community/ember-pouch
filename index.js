/* eslint-env node */
'use strict';

var path = require('path');
var stew = require('broccoli-stew');
var writeFile = require('broccoli-file-creator');
var version = require('./package.json').version;

module.exports = {
  name: 'ember-pouch',

  init: function() {
    this._super.init && this._super.init.apply(this, arguments);

    var bowerDeps = this.project.bowerDependencies();

    if (bowerDeps['pouchdb']) {this.ui.writeWarnLine('Please remove `pouchdb` from `bower.json`. As of ember-pouch 4.2.0, only the NPM package is needed.');}
    if (bowerDeps['relational-pouch']) {this.ui.writeWarnLine('Please remove `relational-pouch` from `bower.json`. As of ember-pouch 4.2.0, only the NPM package is needed.');}
    if (bowerDeps['pouchdb-find']) {this.ui.writeWarnLine('Please remove `pouchdb-find` from `bower.json`. As of ember-pouch 4.2.0, only the NPM package is needed.');}
  },

  treeForVendor: function() {
    var pouchdb = stew.find(path.join(path.dirname(require.resolve('pouchdb')), '..', 'dist'), {
      destDir: 'pouchdb',
      files: ['pouchdb.js']
    });

    var relationalPouch = stew.find(path.join(path.dirname(require.resolve('relational-pouch')), '..', 'dist'), {
      destDir: 'pouchdb',
      files: ['pouchdb.relational-pouch.js']
    });

    var pouchdbFind = stew.find(path.join(path.dirname(require.resolve('pouchdb')), '..', 'dist'), {
      destDir: 'pouchdb',
      files: ['pouchdb.find.js']
    });

    var shims = stew.find(__dirname + '/vendor/pouchdb', {
      destDir: 'pouchdb',
      files: ['shims.js']
    });

    var content = "Ember.libraries.register('Ember Pouch', '" + version + "');";
    var registerVersionTree = writeFile(
      'ember-pouch/register-version.js',
      content
    );

    return stew.find([
      pouchdb,
      relationalPouch,
      pouchdbFind,
      shims,
      registerVersionTree
    ]);
  },

  included(app) {
    this._super.included.apply(this, arguments);

    // see: https://github.com/ember-cli/ember-cli/issues/3718
    if (typeof app.import !== 'function' && app.app) {
      app = app.app;
    }

    app.import('vendor/pouchdb/pouchdb.js');
    app.import('vendor/pouchdb/pouchdb.relational-pouch.js');
    app.import('vendor/pouchdb/pouchdb.find.js');
    app.import('vendor/pouchdb/shims.js', {
      exports: { 'pouchdb': [ 'default' ]}
    });
    app.import('vendor/ember-pouch/register-version.js');

    let env = this.project.config(app.env);
    if (env.emberpouch) {
      if (env.emberpouch.hasOwnProperty('dontsavehasmany')) {
        this.ui.writeWarnLine('The `dontsavehasmany` flag is no longer needed in `config/environment.js`');
      }
    }
  }
};
