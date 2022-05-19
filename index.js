/* eslint-env node */
'use strict';

var stew = require('broccoli-stew');
var writeFile = require('broccoli-file-creator');
var version = require('./package.json').version;

module.exports = {
  name: require('./package').name,
  options: {
    autoImport: {
      webpack: {
        node: {
          global: true,
        },
      },
    },
  },

  init: function () {
    this._super.init && this._super.init.apply(this, arguments);

    var bowerDeps = this.project.bowerDependencies();

    if (bowerDeps['pouchdb']) {
      this.ui.writeWarnLine(
        'Please remove `pouchdb` from `bower.json`. As of ember-pouch 4.2.0, only the NPM package is needed.'
      );
    }
    if (bowerDeps['relational-pouch']) {
      this.ui.writeWarnLine(
        'Please remove `relational-pouch` from `bower.json`. As of ember-pouch 4.2.0, only the NPM package is needed.'
      );
    }
    if (bowerDeps['pouchdb-find']) {
      this.ui.writeWarnLine(
        'Please remove `pouchdb-find` from `bower.json`. As of ember-pouch 4.2.0, only the NPM package is needed.'
      );
    }
  },

  // The following is deprecated:
  treeForVendor: function () {
    var content = "Ember.libraries.register('Ember Pouch', '" + version + "');";
    var registerVersionTree = writeFile(
      'ember-pouch/register-version.js',
      content
    );

    return stew.find([registerVersionTree]);
  },

  included(app) {
    this._super.included.apply(this, arguments);

    // see: https://github.com/ember-cli/ember-cli/issues/3718
    if (typeof app.import !== 'function' && app.app) {
      app = app.app;
    }

    app.import('vendor/ember-pouch/register-version.js');

    let env = this.project.config(app.env);
    if (env.emberpouch) {
      var dontsavehasmany = Object.prototype.hasOwnProperty.call(env.emberpouch, 'dontsavehasmany');
      if (dontsavehasmany) {
        this.ui.writeWarnLine(
          'The `dontsavehasmany` flag is no longer needed in `config/environment.js`'
        );
      }
    }
  },
};
