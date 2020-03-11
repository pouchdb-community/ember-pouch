var ModelBlueprint;

try {
  ModelBlueprint = require('ember-data/blueprints/model');
} catch (e) {
  //eslint-disable-next-line node/no-missing-require
  ModelBlueprint = require('ember-cli/blueprints/model');
}

module.exports = ModelBlueprint;
