import { isArray } from '@ember/array';
import { keys as EmberKeys } from '@ember/polyfills';
import EmberObject, { get } from '@ember/object';
import { isNone } from '@ember/utils';
import DS from 'ember-data';

const keys = Object.keys || EmberKeys;

export default DS.Transform.extend({
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
        content_type: get(attachment, 'content_type'),
      };
      if (get(attachment, 'stub')) {
        serialized.stub = true;
        serialized.length = get(attachment, 'length');
        serialized.digest = get(attachment, 'digest');
      } else {
        serialized.data = get(attachment, 'data');
        serialized.length = get(attachment, 'length');
      }
      acc[get(attachment, 'name')] = serialized;
      return acc;
    }, {});
  },
});
