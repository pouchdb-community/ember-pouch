import Transform from '@ember-data/serializer/transform';
import { isArray } from '@ember/array';
import { keys as EmberKeys } from '@ember/polyfills';
import EmberObject from '@ember/object';
import { isNone } from '@ember/utils';

const keys = Object.keys || EmberKeys;

export default Transform.extend({
  deserialize: function (serialized) {
    if (isNone(serialized)) {
      return [];
    }

    return keys(serialized).map(function (attachmentName) {
      let attachment = serialized[attachmentName];
      return EmberObject.create({
        name: attachmentName,
        content_type: attachment.content_type,
        data: attachment.data,
        stub: attachment.stub,
        length: attachment.length,
        digest: attachment.digest,
      });
    });
  },

  serialize: function (deserialized) {
    if (!isArray(deserialized)) {
      return null;
    }

    return deserialized.reduce(function (acc, attachment) {
      const serialized = {
        content_type: attachment.content_type,
      };
      if (attachment.stub) {
        serialized.stub = true;
        serialized.length = attachment.length;
        serialized.digest = attachment.digest;
      } else {
        serialized.data = attachment.data;
        serialized.length = attachment.length;
      }
      acc[attachment.name] = serialized;
      return acc;
    }, {});
  },
});
