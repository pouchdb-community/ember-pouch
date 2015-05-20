module.exports = {
  scenarios: [
    {
      name: 'default',
      dependencies: {
        'ember': 'components/ember#release',
        'ember-data': '1.0.0-beta.17'
      },
      resolutions: {
        'ember': 'release'
      }
    },
    {
      name: 'legacy ember-data 1.0.0.beta.12',
      dependencies: {
        'ember': 'components/ember#release',
        'ember-data': 'components/ember-data#1.0.0-beta.12'
      },
      resolutions: {
        'ember': 'release'
      }
    },
    {
      name: 'legacy ember-data 1.0.0.beta.14.1',
      dependencies: {
        'ember': 'components/ember#release',
        'ember-data': 'components/ember-data#1.0.0-beta.14.1'
      },
      resolutions: {
        'ember': 'release'
      }
    },
    {
      name: 'legacy ember-data 1.0.0.beta.15',
      dependencies: {
        'ember': 'components/ember#release',
        'ember-data': 'components/ember-data#1.0.0-beta.15'
      },
      resolutions: {
        'ember': 'release'
      }
    },
    {
      name: 'legacy ember-data 1.0.0.beta.16.1',
      dependencies: {
        'ember': 'components/ember#release',
        'ember-data': 'components/ember-data#1.0.0-beta.16.1'
      },
      resolutions: {
        'ember': 'release'
      }
    },
    {
      name: 'ember-release',
      dependencies: {
        'ember': 'components/ember#release'
      },
      resolutions: {
        'ember': 'release'
      }
    },
    {
      name: 'ember-beta',
      dependencies: {
        'ember': 'components/ember#beta'
      },
      resolutions: {
        'ember': 'beta'
      }
    },
    {
      name: 'ember-canary',
      dependencies: {
        'ember': 'components/ember#canary'
      },
      resolutions: {
        'ember': 'canary'
      }
    }
  ]
};
