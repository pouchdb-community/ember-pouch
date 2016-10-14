/*jshint node:true*/
module.exports = {
  scenarios: [
    {
      name: 'ember-2.0-stack',
      npm: {
        devDependencies: {
          'ember-data': '2.0.1'
        }
      },
      bower: {
        dependencies: {
          'ember': '2.0.3',
          'ember-data': '2.0.1',
          'ember-cli-shims': '0.0.6'
        }
      }
    },
    {
      name: 'ember-2.1-stack',
      npm: {
        devDependencies: {
          'ember-data': '2.1.0'
        }
      },
      bower: {
        dependencies: {
          'ember': '2.1.2',
          'ember-data': '2.1.0',
          'ember-cli-shims': '0.0.6'
        }
      }
    },
    {
      name: 'ember-2.2-stack',
      npm: {
        devDependencies: {
          'ember-data': '2.2.1'
        }
      },
      bower: {
        dependencies: {
          'ember': '2.2.2',
          'ember-data': '2.2.1',
          'ember-cli-shims': '0.0.6'
        }
      }
    },
    {
      name: 'ember-2.3-stack',
      npm: {
        devDependencies: {
          'ember-data': '2.3.3'
        }
      },
      bower: {
        dependencies: {
          'ember': '2.3.2'
        }
      }
    },
    {
      name: 'ember-2.4-stack',
      npm: {
        devDependencies: {
          'ember-data': '2.4.3'
        }
      },
      bower: {
        dependencies: {
          'ember': '2.4.6'
        }
      }
    },
    {
      name: 'ember-release',
      npm: {
        devDependencies: {
          'ember-data': 'components/ember-data#release'
        }
      },
      bower: {
        dependencies: {
          'ember': 'components/ember#release'
        },
        resolutions: {
          'ember': 'release'
        }
      }
    },
    {
      name: 'ember-beta',
      npm: {
        devDependencies: {
          'ember-data': 'components/ember-data#beta'
        }
      },
      bower: {
        dependencies: {
          'ember': 'components/ember#beta'
        },
        resolutions: {
          'ember': 'beta'
        }
      }
    },
    {
      name: 'ember-canary',
      npm: {
        devDependencies: {
          'ember-data': 'components/ember-data#canary'
        }
      },
      bower: {
        dependencies: {
          'ember': 'components/ember#canary'
        },
        resolutions: {
          'ember': 'canary'
        }
      }
    }
  ]
};
