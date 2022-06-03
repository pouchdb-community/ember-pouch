'use strict';

const EmberAddon = require('ember-cli/lib/broccoli/ember-addon');
const { maybeEmbroider } = require('@embroider/test-setup');

/**
 * `EMBROIDER_TEST_SETUP_OPTIONS` is set by the Embroider scenarios for `ember-try`:
 * https://github.com/embroider-build/embroider/blob/v0.47.1/packages/test-setup/src/index.ts#L48-L90
 */
const IS_EMBROIDER_ENABLED = Boolean(process.env.EMBROIDER_TEST_SETUP_OPTIONS);

module.exports = function (defaults) {
  let app = new EmberAddon(defaults, {
    // Add options here
    autoImport: {
    /* eslint-disable prettier/prettier */
      webpack: IS_EMBROIDER_ENABLED === false ? {} : {
        node: {
          global: true,
        },
      },
    /* eslint-disable prettier/prettier */      
    }
  });

  /*
    This build file specifies the options for the dummy test app of this
    addon, located in `/tests/dummy`
    This build file does *not* influence how the addon or the app using it
    behave. You most likely want to be modifying `./index.js` or app's build file
  */

  return maybeEmbroider(app, {
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
    /* eslint-disable prettier/prettier */
    /*packagerOptions: {
      webpackConfig: IS_EMBROIDER_ENABLED === false ? {} : {
        node: {
          global: true,
        },
      },
    },*/
    /* eslint-disable prettier/prettier */
  });
};
