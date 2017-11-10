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
          'ember-data': '2.14.10',
          'ember-source': '2.14.1',
        }
      },
    },
    {
      name: 'ember-release',
      bower: {
        dependencies: {
          'ember': 'components/ember#release'
        },
        resolutions: {
          'ember': 'release'
        }
      },
      npm: {
        devDependencies: {
          'ember-data': 'latest',
          'ember-source': null
        }
      }
    },
    {
      name: 'ember-beta',
      bower: {
        dependencies: {
          'ember': 'components/ember#beta'
        },
        resolutions: {
          'ember': 'beta'
        }
      },
      npm: {
        devDependencies: {
          'ember-data': 'beta',
          'ember-source': null
        }
      }
    },
    {
      name: 'ember-canary',
      bower: {
        dependencies: {
          'ember': 'components/ember#canary'
        },
        resolutions: {
          'ember': 'canary'
        }
      },
      npm: {
        devDependencies: {
          'ember-data': 'canary',
          'ember-source': null
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
