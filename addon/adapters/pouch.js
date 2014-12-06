import Ember from 'ember';
import DS from 'ember-data';
import PouchDB from 'pouchdb';

import {
  extractFindOne,
  extractDeleteRecord,
  updateSchemaForType
} from 'ember-pouch/utils';

var bind = Ember.run.bind;
var next = Ember.run.next;

export default DS.Adapter.extend({
  defaultSerializer: '-pouch',
  coalesceFindRequests: true,
  schema: null,
  url: null,

  setup: function(url) {
    url = url || this.url;

    if (url) { this.db = new PouchDB(url); }
  }.on('init'),

  sync: function(store, url) {
    if (!this.db || typeof this.db !== 'object') {
      throw new Error('Please set the `db` property on the adapter.');
    }

    this.sync = this.db.sync(url, { live: true });
    this.changes = this.db.changes( { live: true, since: 'now' });

    this.changes.on('create', bind(this, function(change) {
      next(this, 'onChange', change, store);
    }));

    this.changes.on('update', bind(this, function(change) {
      next(this, 'onChange', change, store);
    }));

    this.changes.on('delete', bind(this, function(change) {
      next(this, 'onDelete', change, store);
    }));

    this.changes.on('error', bind(this, function(error) {
      next(this, 'onError', error, store);
    }));
  },

  willDestroy: function() {
    if (this.sync) {
      this.sync.cancel();
      this.changes.cancel();
    }
  },

  onChange: function(change, store) {
    var typeId = this.db.rel.parseDocID(change.id);
    var record = store.getById(typeId.type, typeId.id);

    if (record) {
      record.reload();
    } else {
      store.find(typeId.type, typeId.id);
    }
  },

  onDelete: function(change, store) {
    var typeId = this.db.rel.parseDocID(change.id);
    var record = store.getById(typeId.type, typeId.id);

    if (record && !record.get('isDeleted')) {
      store.unloadRecord(record);
    }
  },

  onError: function() {},

  defineSchemaForType: function(type) {
    if (!this.db || typeof this.db !== 'object') {
      throw new Error('Please set the `db` property on the adapter.');
    }

    this.schema = updateSchemaForType(type, this.schema)

    this.db.setSchema(this.schema);
  },

  groupRecordsForFindMany: function(store, records) {
    return Object.values(records.groupBy(function(record) {
      return record.constructor.typeKey;
    }));
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

  findQuery: function(/* store, type, query */) {
    throw new Error(
      "findQuery not yet supported by ember-pouch. " +
      "See https://github.com/nolanlawson/ember-pouch/issues/7.");
  },

  find: function(store, type, id) {
    this.defineSchemaForType(type);

    return this.db.rel.find(type.typeKey, id)
      .then(extractFindOne(type));
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

    return this.db.rel.del(type.typeKey, data)
      .then(extractDeleteRecord);
  }
});
