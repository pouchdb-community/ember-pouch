export default DS.RESTAdapter.extend({

  //db: new PouchDB('http://localhost:5984/ember-todo'),

  _init: function (type) {
    var self = this;
    if (!this.db || typeof this.db !== 'object') {
      throw new Error('Please set the `db` property on the adapter.');
    }

    this._schema = this._schema || [];

    var singular = type.typeKey;
    var plural = Ember.String.pluralize(type.typeKey);

    // check that we haven't already registered this model
    for (var i = 0, len = this._schema.length; i < len; i++) {
      var currentSchemaDef = this._schema[i];
      if (currentSchemaDef.singular === singular) {
        return;
      }
    }

    var schemaDef = {
      singular: singular,
      plural: plural
    };

    // else it's new, so update
    this._schema.push(schemaDef);

    // check all the subtypes
    type.eachRelationship(function (_, rel) {
      if (rel.kind !== 'belongsTo' && rel.kind !== 'hasMany') {
        // TODO: support inverse as well
        return; // skip
      }
      var relDef = {};
      relDef[rel.kind] = rel.type.typeKey;
      if (!schemaDef.relations) {
        schemaDef.relations = {};
      }
      schemaDef.relations[rel.key] = relDef;
      self._init(rel.type);
    });

    this.db.setSchema(this._schema);
  },

  _recordToData: function (store, type, record) {
    var data = {};
    var serializer = store.serializerFor(type.typeKey);

    serializer.serializeIntoHash(data, type, record, { includeId: true });

    data = data[type.typeKey];

    // ember sets it to null automatically. don't need it.
    if (data.rev === null) {
      delete data.rev;
    }

    return data;
  },

  findAll: function(store, type /*, sinceToken */) {
    // TODO: use sinceToken
    this._init(type);
    return this.db.rel.find(type.typeKey);
  },

  findMany: function(store, type, ids) {
    this._init(type);
    return this.db.rel.find(type.typeKey, ids);
  },

  find: function (store, type, id) {
    this._init(type);
    return this.db.rel.find(type.typeKey, id).then(function (payload) {
      // Ember Data chokes on empty payload, this function throws
      // an error when the requested data is not found
      var type, hasContents = false;
      if ('object' == typeof payload) {
        for (type in payload) {
          if (payload[type].length > 0) {
            hasContents = true;
            break;
          }
        }
        if (!hasContents) {
          throw new Error('Not found');
        }
      }
      return payload;
    });
  },

  createRecord: function(store, type, record) {
    this._init(type);
    var data = this._recordToData(store, type, record);
    return this.db.rel.save(type.typeKey, data);
  },

  updateRecord: function (store, type, record) {
    this._init(type);
    var data = this._recordToData(store, type, record);
    return this.db.rel.save(type.typeKey, data);
  },

  deleteRecord: function (store, type, record) {
    this._init(type);
    var data = this._recordToData(store, type, record);
    return this.db.rel.del(type.typeKey, data).then(function () {
      return ''; // ember doesn't like getting a json response of {deleted: true}
    });
  }
});
