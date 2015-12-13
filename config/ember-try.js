module.exports = {
  scenarios: [
    {
      name: 'ember-data-1.13',
      dependencies: {
        'ember': '1.13.11',
        'ember-data': '1.13.15'
      },
      resolutions: {
        'ember': '1.13.11'
      }
    },
    {
      name: 'ember-data-2.0',
      dependencies: {
        'ember': '2.0.2',
        'ember-data': '2.0.1'
      },
      resolutions: {
        'ember': '2.0.2'
      }
    },
    {
      name: 'ember-data-2.1',
      dependencies: {
        'ember': '2.1.1',
        'ember-data': '2.1.0'
      },
      resolutions: {
        'ember': '2.1.1'
      }
    },
    {
      name: 'ember-data-2.2',
      dependencies: {
        'ember': '2.2.0',
        'ember-data': '2.2.1'
      },
      resolutions: {
        'ember': '2.2.0'
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
