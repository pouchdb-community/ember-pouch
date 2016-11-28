import Ember from 'ember';
import DS from 'ember-data';
import getOwner from 'ember-getowner-polyfill';

const {
  get,
} = Ember;
const keys = Object.keys || Ember.keys;
const assign = Object.assign || Ember.assign;

export default DS.RESTSerializer.extend({
  
  init: function() {
  	this._super(...arguments);
  	
    let config = getOwner(this).resolveRegistration('config:environment');
  	this.dontsavedefault = config['emberpouch'] && config['emberpouch']['dontsavehasmany'];
  },
  
  _getDontsave(relationship) {
  	return !Ember.isEmpty(relationship.options.dontsave) ? relationship.options.dontsave : this.dontsavedefault;
  },

  _shouldSerializeHasMany: function(snapshot, key, relationship) {
  	let dontsave = this._getDontsave(relationship);
  	let result = !dontsave;
    return result;
  },

  // This fixes a failure in Ember Data 1.13 where an empty hasMany
  // was saving as undefined rather than [].
  serializeHasMany(snapshot, json, relationship) {
  	if (this._shouldSerializeHasMany(snapshot, relationship.key, relationship)) {
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
      json.attachments = assign({}, json.attachments || {}, json[payloadKey]); // jshint ignore:line
      json[payloadKey] = keys(json[payloadKey]).reduce((attr, fileName) => {
        attr[fileName] = assign({}, json[payloadKey][fileName]); // jshint ignore:line
        delete attr[fileName].data;
        delete attr[fileName].content_type;
        return attr;
      }, {});
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
  },
  
  extractRelationships(modelClass) {
  	let relationships = this._super(...arguments);

  	modelClass.eachRelationship((key, relationshipMeta) => {
  	  if (relationshipMeta.kind === 'hasMany' && this._getDontsave(relationshipMeta) && !!relationshipMeta.options.async) {
  	  	relationships[key] = { links: { related: key } };
  	  }
  	});
  	
  	return relationships;
  }
});
