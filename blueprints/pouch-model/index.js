var ModelBlueprint;

try {
  ModelBlueprint = require('ember-data/blueprints/model');
} catch (e) {
  ModelBlueprint = require('ember-cli/blueprints/model');
}

module.exports = ModelBlueprint;
