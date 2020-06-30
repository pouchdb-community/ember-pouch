import { isNone } from '@ember/utils';
import AttachmentsTransform from './attachments';

export default AttachmentsTransform.extend({
  deserialize: function(serialized) {
    let atts = this._super(serialized);
    
    if (atts.length > 0) {
      return atts.pop();
    } else {
      return null;
    }
  },
  serialize: function(deserialized) {
    if (isNone(deserialized)) { return {}; }
    return this._super([deserialized]);
  }
});
