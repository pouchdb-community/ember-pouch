import DS from 'ember-data';

export default DS.RESTSerializer.extend({
  _shouldSerializeHasMany: function() { return true; }
});