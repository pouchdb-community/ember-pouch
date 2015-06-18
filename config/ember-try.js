module.exports = {
  scenarios: [
    {
      name: 'ember-data-beta.15',
      dependencies: {
        'ember': '1.10.0',
        'ember-data': '1.0.0-beta.15'
      },
      resolutions: {
        'ember': '1.10.0'
      }
    },
    {
      name: 'ember-data-beta.16',
      dependencies: {
        'ember': '1.10.0',
        'ember-data': '1.0.0-beta.16.1'
      },
      resolutions: {
        'ember': '1.10.0'
      }
    },
    {
      name: 'ember-data-beta.18',
      dependencies: {
        'ember': '1.12.1',
        'ember-data': '1.0.0-beta.18'
      },
      resolutions: {
        'ember': '1.12.1'
      }
    },
    {
      name: 'ember-data-beta.19',
      dependencies: {
        'ember': '1.13.2',
        'ember-data': '1.0.0-beta.19.2'
      },
      resolutions: {
        'ember': '1.13.2'
      }
    },
    {
      name: 'ember-data-1.13',
      dependencies: {
        'ember': '1.13.2',
        'ember-data': '1.13.2'
      },
      resolutions: {
        'ember': '1.13.2'
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
