import Ember from 'ember';
import DS from 'ember-data';
import PouchDB from 'pouchdb';

export default DS.Adapter.extend({
  defaultSerializer: '-pouch',
  coalesceFindRequests: true,
  schema: null,

  setup: function(url) {
    if (!url) {
      throw new Error('Please provide database url.');
    }

    this.db = new PouchDB(url);
  },

  sync: function(store, url) {
    if (!this.db || typeof this.db !== 'object') {
      throw new Error('Please set the `db` property on the adapter.');
    }

    this.db.sync(url, { live: true });

    this.db
      .changes({ since: 'now', live: true })
      .on('change', (change) => {
        var typeId = this.db.rel.parseDocID(change.id);
        var record = store.getById(typeId.type, typeId.id);

        if (change.deleted) {
          if (record) {
            store.unloadRecord(record);
          }
        } else if (record) {
          record.reload();
        } else {
          store.find(typeId.type, typeId.id);
        }
      })
      .on('error', (error) => {
        console.error(error);
      });
  },

  defineSchemaForType: function(type) {
    if (!this.db || typeof this.db !== 'object') {
      throw new Error('Please set the `db` property on the adapter.');
    }

    this.schema = this.schema || Ember.A();

    var singular = type.typeKey;
    var plural = Ember.String.pluralize(type.typeKey);

    // check that we haven't already registered this model
    if (this.schema.findBy('singular', singular)) {
      return;
    }

    var schemaDef = {
      singular: singular,
      plural: plural
    };

    // else it's new, so update
    this.schema.push(schemaDef);

    // check all the subtypes
    type.eachRelationship((_, rel) => {
      if (rel.kind !== 'belongsTo' && rel.kind !== 'hasMany') {
        // TODO: support inverse as well
        return; // skip
      }
      var relDef = {};
      relDef[rel.kind] = {
        type: rel.type.typeKey,
        options: rel.options
      };
      if (!schemaDef.relations) {
        schemaDef.relations = {};
      }
      schemaDef.relations[rel.key] = relDef;
      this.defineSchemaForType(rel.type);
    });

    this.db.setSchema(this.schema);
  },

  findAll: function(store, type /*, sinceToken */) {
    // TODO: use sinceToken
    this.defineSchemaForType(type);

    return this.db.rel.find(type.typeKey);
  },

  findMany: function(store, type, ids) {
    this.defineSchemaForType(type);

    return this.db.rel.find(type.typeKey, ids);
  },

  groupRecordsForFindMany: function(store, records) {
    return Object.values(records.groupBy(function(record) {
      return record.constructor.typeKey;
    }));
  },

  findQuery: function(/* store, type, query */) {
    throw new Error(
      "findQuery not yet supported by ember-pouch. " +
      "See https://github.com/nolanlawson/ember-pouch/issues/7.");
  },

  find: function(store, type, id) {
    this.defineSchemaForType(type);

    return this.db.rel.find(type.typeKey, id).then(function(payload) {
      // Ember Data chokes on empty payload, this function throws
      // an error when the requested data is not found
      if (typeof payload === 'object' && payload !== null) {
        var singular = type.typeKey;
        var plural = Ember.String.pluralize(type.typeKey);
        var results = payload[singular] || payload[plural];
        if (results && results.length > 0) {
          return payload;
        }
      }

      throw new Error('Not found: type "' + type.typeKey +
        '" with id "' + id + '"');
    });
  },

  createRecord: function(store, type, record) {
    this.defineSchemaForType(type);

    var data = {};
    var serializer = store.serializerFor(type.typeKey);

    serializer.serializeIntoHash(data, type, record, { includeId: false });

    return this.db.rel.save(type.typeKey, data);
  },

  updateRecord: function(store, type, record) {
    this.defineSchemaForType(type);

    var data = {};
    var serializer = store.serializerFor(type.typeKey);

    serializer.serializeIntoHash(data, type, record, { includeId: true });

    return this.db.rel.save(type.typeKey, data);
  },

  deleteRecord: function(store, type, record) {
    this.defineSchemaForType(type);

    var data = {};
    var serializer = store.serializerFor(type.typeKey);

    serializer.serializeIntoDeleteHash(data, type, record);

    return this.db.rel.del(type.typeKey, data).then(() => null);
  }
});
