import { isNone } from '@ember/utils';
import AttachmentsTransform from './attachments';

export default AttachmentsTransform.extend({
  deserialize: function (serialized) {
    return this._super(serialized).pop();
  },
  serialize: function (deserialized) {
    if (isNone(deserialized)) {
      return null;
    }
    return this._super([deserialized]);
  },
});
