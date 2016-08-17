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
        length: serialized[attachmentName]['length'],
        digest: serialized[attachmentName]['digest']
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
        serialized.length = attachment.get('length');
        serialized.digest = attachment.get('digest');
      } else {
        serialized.data = attachment.get('data');
      }
      acc[attachment.get('name')] = serialized;
      return acc;
    }, {});
  }
});
