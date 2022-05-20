'use strict';

const getChannelURL = require('ember-source-channel-url');
const { embroiderSafe, embroiderOptimized } = require('@embroider/test-setup');

module.exports = async function () {
  return {
    scenarios: [
      {
        name: 'ember-2.4-stack',
        npm: {
          devDependencies: {
            'ember-data': '2.4.3',
            'ember-inflector': '^1.9.4',
            'ember-source': null,
            'ember-cli-shims': null,
          },
        },
        bower: {
          dependencies: {
            ember: '2.4.6',
            'ember-cli-shims': '0.1.1',
          },
        },
      },
      {
        name: 'ember-lts-2.8',
        bower: {
          dependencies: {
            ember: 'components/ember#lts-2-8',
            'ember-cli-shims': '0.1.1',
          },
          resolutions: {
            ember: 'lts-2-8',
          },
        },
        npm: {
          devDependencies: {
            'ember-data': '2.8.1',
            'ember-inflector': '^1.9.4',
            'ember-source': null,
            'ember-cli-shims': null,
          },
        },
      },
      {
        name: 'ember-lts-2.12',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'jquery-integration': true,
          }),
        },
        npm: {
          devDependencies: {
            '@ember/jquery': '^0.5.1',
            'ember-data': '2.12.2',
            'ember-inflector': '^1.9.4',
            'ember-source': '2.12.2',
            'ember-cli-shims': '^1.1.0',
          },
        },
      },
      {
        name: 'ember-2.14-stack',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'jquery-integration': true,
          }),
        },
        npm: {
          devDependencies: {
            '@ember/jquery': '^0.5.1',
            'ember-data': '~2.14.0',
            'ember-source': '~2.14.0',
          },
        },
      },
      {
        name: 'ember-lts-2.16',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'jquery-integration': true,
          }),
        },
        npm: {
          devDependencies: {
            '@ember/jquery': '^0.5.1',
            'ember-data': '~2.16.0',
            'ember-source': '~2.16.0',
          },
        },
      },
      {
        name: 'ember-lts-2.18',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'jquery-integration': true,
          }),
        },
        npm: {
          devDependencies: {
            '@ember/jquery': '^0.5.1',
            'ember-data': '~2.18.0',
            'ember-source': '~2.18.0',
          },
        },
      },
      {
        name: 'ember-lts-3.4',
        npm: {
          devDependencies: {
            'ember-source': '~3.4.0',
            'ember-data': '~3.4.0',
          },
        },
      },
      {
        name: 'ember-lts-3.8',
        npm: {
          devDependencies: {
            'ember-source': '~3.8.0',
            'ember-data': '~3.8.0',
          },
        },
      },
      {
        name: 'ember-lts-3.12',
        npm: {
          devDependencies: {
            'ember-source': '~3.12.0',
            'ember-data': '~3.12.0',
          },
        },
      },
      {
        name: 'ember-lts-3.16',
        npm: {
          devDependencies: {
            'ember-source': '~3.16.0',
          },
        },
      },
      {
        name: 'ember-lts-3.24',
        npm: {
          devDependencies: {
            'ember-source': '~3.24.3',
          },
        },
      },
      {
        name: 'ember-lts-3.28',
        npm: {
          devDependencies: {
            'ember-source': '~3.28.0',
          },
        },
      },
      {
        name: 'ember-release',
        npm: {
          devDependencies: {
            'ember-data': 'latest',
          },
        },
      },
      {
        name: 'ember-beta',
        npm: {
          devDependencies: {
            'ember-data': 'beta',
            'ember-source': await getChannelURL('beta'),
          },
        },
      },
      {
        name: 'ember-canary',
        npm: {
          devDependencies: {
            'ember-data': 'canary',
            'ember-source': await getChannelURL('canary'),
          },
        },
      },
      // The default `.travis.yml` runs this scenario via `npm test`,
      // not via `ember try`. It's still included here so that running
      // `ember try:each` manually or from a customized CI config will run it
      // along with all the other scenarios.
      {
        name: 'ember-default',
        npm: {
          devDependencies: {},
        },
      },
      {
        name: 'ember-default-with-jquery',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'jquery-integration': true,
          }),
        },
        npm: {
          devDependencies: {
            '@ember/jquery': '^1.1.0',
          },
        },
      },
      {
        name: 'ember-classic',
        env: {
          EMBER_OPTIONAL_FEATURES: JSON.stringify({
            'application-template-wrapper': true,
            'default-async-observers': false,
            'template-only-glimmer-components': false,
          }),
        },
        npm: {
          devDependencies: {
            'ember-source': '~3.28.0',
          },
          ember: {
            edition: 'classic',
          },
        },
      },
      embroiderSafe(),
      embroiderOptimized(),
    ],
  };
};
