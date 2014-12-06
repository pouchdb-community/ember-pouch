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
  }
});
