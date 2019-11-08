module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
  ],
  env: {
    browser: true,
  },
  plugins: ['ember'],
  rules: {
    'ember/no-jquery': 'error',
    'ember/no-restricted-resolver-tests': 'warn',
  },
  overrides: [
    {
      // node files
      files: [
        '.eslintrc.js',
        '.template-lintrc.js',
        'ember-cli-build.js',
        'index.js',
        'testem.js',
        'blueprints/*/index.js',
        'config/**/*.js',
        'tests/dummy/config/**/*.js'
      ],
      excludedFiles: [
        'addon/**',
        'addon-test-support/**',
        'app/**',
        'tests/dummy/app/**'
      ],
      parserOptions: {
        sourceType: 'script'
      },
      env: {
        browser: false,
        node: true
      },
      plugins: ['node'],
      rules: Object.assign({}, require('eslint-plugin-node').configs.recommended.rules, {
        // add your custom rules and overrides for node files here
        "node/no-missing-require": ["error", {
            "allowModules": ["ember-cli"],
        }],
        "node/no-unpublished-require": ["error", {
            "allowModules": ["ember-data", "ember-cli"],
        }],
      })
    }
  ]
};
