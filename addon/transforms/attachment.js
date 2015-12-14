import Ember from 'ember';
import DS from 'ember-data';

const { isNone } = Ember;
const keys = Object.keys || Ember.keys;

export default DS.Transform.extend({
  deserialize: function(serialized) {
    if (isNone(serialized)) { return null; }

    return keys(serialized).map(function (attachmentName) {
      return Ember.Object.create({
        name: attachmentName,
        content_type: serialized[attachmentName]['content_type'],
        data: serialized[attachmentName]['data'],
        stub: serialized[attachmentName]['stub'],
      });
    });
  },

  serialize: function(deserialized) {
    if (!Ember.isArray(deserialized)) { return null; }

    return deserialized.reduce(function (acc, attachment) {
      const serialized = {
        content_type: attachment.get('content_type'),
      };
      if (attachment.get('stub')) {
        serialized.stub = true;
      } else {
        serialized.data = attachment.get('data');
      }
      acc[attachment.get('name')] = serialized;
      return acc;
    }, {});
  }
});
