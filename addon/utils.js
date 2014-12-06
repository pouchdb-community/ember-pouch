import Ember from 'ember';

// Ember Data chokes on empty payload, this function throws
// an error when the requested data is not found
function extractFindOne(type) {
  return function(payload) {
    if (typeof payload === 'object' && payload !== null) {
      var singular = type.typeKey;
      var plural = Ember.String.pluralize(type.typeKey);
      var results = payload[singular] || payload[plural];

      if (results && results.length > 0) {
        return payload;
      }
    }

    throw new Error('Not found: type "' + type.typeKey +
      '" with id "' + id + '"');
  }
}

function extractDeleteRecord() {
  return null;
}

function updateSchemaForType(type, schema) {
  schema = schema || Ember.A();

  var singular = type.typeKey;
  var plural = Ember.String.pluralize(type.typeKey);

  // check that we haven't already registered this model
  if (schema.findBy('singular', singular)) {
    return schema;
  }

  var schemaDef = {
    singular: singular,
    plural: plural
  };

  // else it's new, so update
  schema.push(schemaDef);

  // check all the subtypes
  type.eachRelationship(function(_, rel) {
    if (rel.kind !== 'belongsTo' && rel.kind !== 'hasMany') {
      // TODO: support inverse as well
      return; // skip
    }
    var relDef = {};
    relDef[rel.kind] = {
      type: rel.type.typeKey,
      options: rel.options
    };
    if (!schemaDef.relations) {
      schemaDef.relations = {};
    }
    schemaDef.relations[rel.key] = relDef;
    schema = updateSchemaForType(rel.type, schema);
  });

  return schema;
}

export { extractFindOne, extractDeleteRecord, updateSchemaForType };
