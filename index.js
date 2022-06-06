/* eslint-env node */
'use strict';

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
  },

  included(app) {
    this._super.included.apply(this, arguments);

    // see: https://github.com/ember-cli/ember-cli/issues/3718
    if (typeof app.import !== 'function' && app.app) {
      app = app.app;
    }

    let env = this.project.config(app.env);
    if (env.emberpouch) {
      if (
        Object.prototype.hasOwnProperty.call(env.emberpouch, 'dontsavehasmany')
      ) {
        this.ui.writeWarnLine(
          'The `dontsavehasmany` flag is no longer needed in `config/environment.js`'
        );
      }
    }
  },
};
