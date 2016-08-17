import Ember from 'ember';
import AttachmentsTransform from './attachments';

const {
  isNone
} = Ember;

export default AttachmentsTransform.extend({
  deserialize: function(serialized) {
    return this._super(serialized).pop();
  },
  serialize: function(deserialized) {
    if (isNone(deserialized)) { return null; }
    return this._super([deserialized]);
  }
});
