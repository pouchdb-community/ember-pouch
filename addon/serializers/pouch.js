import Ember from 'ember';
import DS from 'ember-data';

const {
  get
} = Ember;
const keys = Object.keys || Ember.keys;

export default DS.RESTSerializer.extend({
  _shouldSerializeHasMany: function() {
    return true;
  },

  // This fixes a failure in Ember Data 1.13 where an empty hasMany
  // was saving as undefined rather than [].
  serializeHasMany(snapshot, json, relationship) {
    this._super.apply(this, arguments);

    const key = relationship.key;

    if (!json[key]) {
      json[key] = [];
    }
  },

  _isAttachment(attribute) {
    return ['attachment', 'attachments'].indexOf(attribute.type) !== -1;
  },

  serializeAttribute(snapshot, json, key, attribute) {
    this._super(snapshot, json, key, attribute);
    if (this._isAttachment(attribute)) {
      // if provided, use the mapping provided by `attrs` in the serializer
      var payloadKey = this._getMappedKey(key, snapshot.type);
      if (payloadKey === key && this.keyForAttribute) {
        payloadKey = this.keyForAttribute(key, 'serialize');
      }
      // assign any attachments to the attachments property, so that relational-pouch
      // will put these in the special CouchDB _attachments property
      // this will conflict with any 'attachments' attr in the model
      // suggest that #toRawDoc in relational-pouch should allow _attachments to be specified
      json['attachments'] = Object.assign({}, json['attachments'], json[payloadKey]);
    }
  },

  extractAttributes(modelClass, resourceHash) {
    let attributes = this._super(modelClass, resourceHash);
    let modelAttrs = get(modelClass, 'attributes');
    modelClass.eachTransformedAttribute(key => {
      let attribute = modelAttrs.get(key);
      if (this._isAttachment(attribute)) {
        // put the corresponding _attachments entries from the response into the attribute
        let fileNames = keys(attributes[key]);
        fileNames.forEach(fileName => {
          attributes[key][fileName] = resourceHash.attachments[fileName];
        });
      }
    });
    return attributes;
  }
});
