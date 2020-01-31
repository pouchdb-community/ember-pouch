/* eslint-env node */

const getChannelURL = require('ember-source-channel-url');

module.exports = function() {
  return Promise.all([
    getChannelURL('release'),
    getChannelURL('beta'),
    getChannelURL('canary')
  ]).then((urls) => {
    return {
  scenarios: [
    {
      name: 'ember-2.4-stack',
      npm: {
        devDependencies: {
          'ember-data': '2.4.3',
          'ember-inflector': '^1.9.4',
          'ember-source': null,
          'ember-cli-shims': null
        }
      },
      bower: {
        dependencies: {
          'ember': '2.4.6',
          'ember-cli-shims': '0.1.1'
        }
      }
    },
    {
      name: 'ember-lts-2.8',
      bower: {
        dependencies: {
          'ember': 'components/ember#lts-2-8',
          'ember-cli-shims': '0.1.1'
        },
        resolutions: {
          'ember': 'lts-2-8'
        }
      },
      npm: {
        devDependencies: {
          'ember-data': '2.8.1',
          'ember-inflector': '^1.9.4',
          'ember-source': null,
          'ember-cli-shims': null
        }
      }
    },
    {
      name: 'ember-lts-2.12',
      npm: {
        devDependencies: {
          'ember-data': '2.12.2',
          'ember-inflector': '^1.9.4',
          'ember-source': '2.12.2',
          'ember-cli-shims': '^1.1.0'
        }
      }
    },
    {
      name: 'ember-2.14-stack',
      npm: {
        devDependencies: {
          'ember-data': '~2.14.0',
          'ember-source': '~2.14.0',
        }
      },
    },
    {
      name: 'ember-lts-2.16',
      npm: {
        devDependencies: {
          'ember-data': '~2.16.0',
          'ember-source': '~2.16.0',
        }
      }
    },
    {
      name: 'ember-lts-2.18',
      npm: {
        devDependencies: {
          'ember-data': '~2.18.0',
          'ember-source': '~2.18.0',
        }
      }
    },
{
      name: 'ember-lts-3.4',
      npm: {
        devDependencies: {
          'ember-source': '~3.4.0',
          'ember-data': '~3.4.0',
        }
      }
    },
    {
      name: 'ember-lts-3.8',
      npm: {
        devDependencies: {
          'ember-source': '~3.8.0',
          'ember-data': '~3.8.0',
        }
      }
    },
    {
      name: 'ember-lts-3.12',
      npm: {
        devDependencies: {
          'ember-source': '~3.12.0',
          'ember-data': '~3.12.0',
        }
      }
    },
    {
      name: 'ember-release',
      npm: {
        devDependencies: {
          'ember-data': 'latest',
          'ember-source': urls[0]
        }
      }
    },
    {
      name: 'ember-beta',
      npm: {
        devDependencies: {
          'ember-data': 'beta',
          'ember-source': urls[1]
        }
      }
    },
    {
      name: 'ember-canary',
      npm: {
        devDependencies: {
          'ember-data': 'canary',
          'ember-source': urls[2]
        }
      }
    },
    {
      name: 'ember-default',
      npm: {
        devDependencies: {}
      }
    }
  ]
    };
  });
};
