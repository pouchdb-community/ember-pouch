/* eslint-env node */
module.exports = {
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
          "ember-cli-shims": "0.1.1"
        }
      }
    },
    {
      name: 'ember-lts-2.8',
      npm: {
        devDependencies: {
          'ember-data': '2.8.1',
          'ember-inflector': '^1.9.4',
          'ember-source': null,
          'ember-cli-shims': null
        }
      },
      bower: {
        dependencies: {
          'ember': '2.8.3',
          "ember-cli-shims": "0.1.1"
        }
      }
    },
    {
      name: 'ember-2.10-stack',
      npm: {
        devDependencies: {
          'ember-data': '2.10.0',
          'ember-inflector': '^1.9.4',
          'ember-source': null,
          'ember-cli-shims': null
        }
      },
      bower: {
        dependencies: {
          'ember': '2.10.2',
          "ember-cli-shims": "0.1.1"
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
          'ember-cli-shims': "^1.1.0"
        }
      },
    },
    {
      name: 'ember-2.14-stack',
      npm: {
        devDependencies: {
          'ember-data': '2.14.10',
          'ember-source': '2.14.1',
        }
      },
    },
    {
      name: 'ember-release',
      npm: {
        devDependencies: {
          'ember-data': 'latest',
          'ember-source': 'latest',
        },
      }
    },
    {
      name: 'ember-beta',
      npm: {
        devDependencies: {
          'ember-data': 'beta',
          'ember-source': 'beta',
        },
      }
    },
//    {
//      name: 'ember-canary',
//      npm: {
//        devDependencies: {
//          'ember-data': 'components/ember-data#canary',
//          'ember-source': 'components/ember#canary',
//        },
//      },
//    }
  ]
};
