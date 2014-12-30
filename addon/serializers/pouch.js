import Ember from 'ember';
import DS from 'ember-data';

var get = Ember.get;
var merge = Ember.merge;

export default DS.RESTSerializer.extend({
  serializeIntoHash: function(hash, type, record, options) {
    merge(hash, this.serialize(record, options));
  },
  serializeIntoDeleteHash: function(hash, type, record) {
    var typeKey = type.typeKey;
    var primaryKey = get(this, 'primaryKey');

    var id = get(record, 'id');

    if (id) {
      hash[primaryKey] = id;
    }

    this.rev = this.rev || {};
    this.rev[typeKey] = this.rev[typeKey] || {};
    var rev = this.rev[typeKey][id];

    if (rev) { hash.rev = rev; }
  },

  rev: null,

  serialize: function(record, options) {
    var json = this._super.apply(this, arguments);

    if (options.includeId) {
      var typeKey = record.constructor.typeKey;
      var primaryKey = get(this, 'primaryKey');
      var id = json[primaryKey];

      this.rev = this.rev || {};
      this.rev[typeKey] = this.rev[typeKey] || {};
      var rev = this.rev[typeKey][id];

      if (rev) { json.rev = rev; }
    }

    return json;
  },

  normalize: function(type, hash) {
    hash = this._super.apply(this, arguments);
    var typeKey = type.typeKey;
    var primaryKey = get(this, 'primaryKey');

    if (hash && hash.rev) {
      var id = hash[primaryKey];

      this.rev = this.rev || {};
      this.rev[typeKey] = this.rev[typeKey] || {};
      this.rev[typeKey][id] = hash.rev;
      delete hash.rev;
    }

    return hash;
  },

  serializeHasMany: function(record, json, relationship) {
    var key = relationship.key;

    if (this._canSerialize(key)) {
      var payloadKey;

      // if provided, use the mapping provided by `attrs` in
      // the serializer
      payloadKey = this._getMappedKey(key);
      if (payloadKey === key && this.keyForRelationship) {
        payloadKey = this.keyForRelationship(key, "hasMany");
      }

      var relationshipType = record.constructor.determineRelationshipType(relationship);

      if (relationshipType === 'manyToNone' || relationshipType === 'manyToMany' || relationshipType === 'manyToOne') {
        json[payloadKey] = get(record, key).mapBy('id');
        // TODO support for polymorphic manyToNone and manyToMany relationships
      }
    }
  }
});
