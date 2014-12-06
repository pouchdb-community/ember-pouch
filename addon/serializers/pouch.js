import DS from 'ember-data';
var merge = Ember.merge;

export default DS.RESTSerializer.extend({
  serializeIntoHash: function(hash, type, record, options) {
    merge(hash, this.serialize(record, options));
    if (hash.rev === null) { delete hash.rev; }
  },
  serializeIntoDeleteHash: function(hash, type, record) {
    var data = this.serialize(record, { includeId: true });
    merge(hash, { id: data.id, rev: data.rev });
  }
});
