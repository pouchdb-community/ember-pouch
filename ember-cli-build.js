/* eslint-env node */
'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');

module.exports = function(defaults) {
  let app = new EmberAddon(defaults, {
    autoImport: {
      webpack: {
        node: {
          global: true
        }
      },
      // We could use ember-auto-import for these, but index.js is already handling them
      exclude: ['pouchdb', 'pouchdb-find', 'relational-pouch']
    }
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  return app.toTree();
};
