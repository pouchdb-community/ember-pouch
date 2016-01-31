import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  _shouldSerializeHasMany: function() {
    return true;
  },

  // This fixes a failure in Ember Data 1.13 where an empty hasMany
  // was saving as undefined rather than [].
  serializeHasMany(snapshot, json, relationship) {
    this._super.apply(this, arguments);

    const key = relationship.key;

    if (!json[key]) {
      json[key] = [];
    }
  }
});
