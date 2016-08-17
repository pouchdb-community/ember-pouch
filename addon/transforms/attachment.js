import Ember from 'ember';
import DS from 'ember-data';

const {
  get,
  isNone
} = Ember;
const keys = Object.keys || Ember.keys;

export default DS.Transform.extend({
  deserialize: function(serialized) {
    if (isNone(serialized)) { return []; }

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
        content_type: get(attachment, 'content_type'),
      };
      if (get(attachment, 'stub')) {
        serialized.stub = true;
        serialized.length = get(attachment, 'length');
        serialized.digest = get(attachment, 'digest');
      } else {
        serialized.data = get(attachment, 'data');
      }
      acc[get(attachment, 'name')] = serialized;
      return acc;
    }, {});
  }
});
