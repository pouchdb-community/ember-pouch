module.exports = {
  scenarios: [
    {
      name: 'ember-data-2.0',
      dependencies: {
        'ember': '2.0.2',
        'ember-data': '2.0.1',
        'ember-cli-shims': '0.0.6'
      },
      resolutions: {
        'ember': '2.0.2'
      }
    },
    {
      name: 'ember-data-2.1',
      dependencies: {
        'ember': '2.1.1',
        'ember-data': '2.1.0',
        'ember-cli-shims': '0.0.6'
      },
      resolutions: {
        'ember': '2.1.1'
      }
    },
    {
      name: 'ember-data-2.2',
      dependencies: {
        'ember': '2.2.0',
        'ember-data': '2.2.1',
        'ember-cli-shims': '0.0.6'
      },
      resolutions: {
        'ember': '2.2.0'
      }
    },
    {
      name: 'ember-data-2.3',
      dependencies: {
        'ember': '2.2.1',
        'ember-data': '2.3.0',
      },
      resolutions: {
        'ember': '2.2.1'
      }
    },
    {
      name: 'ember-release',
      dependencies: {
        'ember': 'components/ember#release',
        'ember-data': 'components/ember-data#release'
      },
      resolutions: {
        'ember': 'release'
      }
    },
    {
      name: 'ember-beta',
      dependencies: {
        'ember': 'components/ember#beta',
        'ember-data': 'components/ember-data#beta'
      },
      resolutions: {
        'ember': 'beta'
      }
    },
    {
      name: 'ember-canary',
      dependencies: {
        'ember': 'components/ember#canary',
        'ember-data': 'components/ember-data#canary'
      },
      resolutions: {
        'ember': 'canary'
      }
    }
  ]
};
