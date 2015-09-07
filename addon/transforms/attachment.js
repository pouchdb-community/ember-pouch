import Ember from 'ember';
import DS from 'ember-data';

export default DS.Transform.extend({
  deserialize: function(serialized) {
    if (Ember.isNone(serialized)) { return null; }

    const keys = Object.keys || Ember.keys;

    return keys(serialized).map(function (attachmentName) {
      return {
        name: attachmentName,
        content_type: serialized[attachmentName]['content_type'],
        data: serialized[attachmentName]['data']
      };
    });
  },

  serialize: function(deserialized) {
    if (!Ember.isArray(deserialized)) { return null; }

    return deserialized.reduce(function (acc, attachment) {
      acc[attachment.name] = {
        content_type: attachment.content_type,
        data: attachment.data
      };
      return acc;
    }, {});
  }
});
