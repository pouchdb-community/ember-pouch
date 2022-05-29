import JSONSerializer from '@ember-data/serializer/json';
import RESTSerializer from '@ember-data/serializer/rest';
import { keys as EmberKeys } from '@ember/polyfills';

import { shouldSaveRelationship } from '../utils';

const keys = Object.keys || EmberKeys;

var Serializer = RESTSerializer.extend({
  init: function () {
    this._super(...arguments);
  },

  shouldSerializeHasMany: function (snapshot, key, relationship) {
    let result = shouldSaveRelationship(this, relationship);
    return result;
  },

  // This fixes a failure in Ember Data 1.13 where an empty hasMany
  // was saving as undefined rather than [].
  serializeHasMany(snapshot, json, relationship) {
    if (
      this._shouldSerializeHasMany(snapshot, relationship.key, relationship)
    ) {
      this._super.apply(this, arguments);

      const key = relationship.key;

      if (!json[key]) {
        json[key] = [];
      }
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

      // Merge any attachments in this attribute into the `attachments` property.
      // relational-pouch will put these in the special CouchDB `_attachments` property
      // of the document.
      // This will conflict with any 'attachments' attr in the model. Suggest that
      // #toRawDoc in relational-pouch should allow _attachments to be specified
      json.attachments = Object.assign(
        {},
        json.attachments || {},
        json[payloadKey]
      ); // jshint ignore:line
      json[payloadKey] = keys(json[payloadKey]).reduce((attr, fileName) => {
        attr[fileName] = Object.assign({}, json[payloadKey][fileName]); // jshint ignore:line
        delete attr[fileName].data;
        delete attr[fileName].content_type;
        return attr;
      }, {});
    }
  },

  extractAttributes(modelClass, resourceHash) {
    let attributes = this._super(modelClass, resourceHash);
    let modelAttrs = modelClass.attributes;
    modelClass.eachTransformedAttribute((key) => {
      let attribute = modelAttrs.get(key);
      if (this._isAttachment(attribute)) {
        // put the corresponding _attachments entries from the response into the attribute
        let fileNames = keys(attributes[key]);
        fileNames.forEach((fileName) => {
          attributes[key][fileName] = resourceHash.attachments[fileName];
        });
      }
    });
    return attributes;
  },

  extractRelationships(modelClass) {
    let relationships = this._super(...arguments);

    modelClass.eachRelationship((key, relationshipMeta) => {
      if (
        relationshipMeta.kind === 'hasMany' &&
        !shouldSaveRelationship(this, relationshipMeta) &&
        !!relationshipMeta.options.async
      ) {
        relationships[key] = { links: { related: key } };
      }
    });

    return relationships;
  },
});

// DEPRECATION: The private method _shouldSerializeHasMany has been promoted to the public API
// See https://www.emberjs.com/deprecations/ember-data/v2.x/#toc_jsonserializer-shouldserializehasmany
if (!JSONSerializer.prototype.shouldSerializeHasMany) {
  Serializer.reopen({
    _shouldSerializeHasMany(snapshot, key, relationship) {
      return this.shouldSerializeHasMany(snapshot, key, relationship);
    },
  });
}

export default Serializer;
