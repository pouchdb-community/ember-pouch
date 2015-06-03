import Ember from 'ember';
import DS from 'ember-data';

import {
  extractDeleteRecord
} from 'ember-pouch/utils';

const {
  run: {
    bind
  },
  on,
  String: {
    pluralize,
    classify
  }
} = Ember;

export default DS.RESTAdapter.extend({
  coalesceFindRequests: true,

  _startChangesToStoreListener: on('init', function () {
    this.changes = this.db.changes({
      since: 'now',
      live: true,
      returnDocs: false
    }).on('change', bind(this, 'onChange'));
  }),

  onChange: function (change) {
    // If relational_pouch isn't initialized yet, there can't be any records
    // in the store to update.
    if (!this.db.rel) { return; }

    var obj = this.db.rel.parseDocID(change.id);
    // skip changes for non-relational_pouch docs. E.g., design docs.
    if (!obj.type || !obj.id || obj.type === '') { return; }

    var store = this.container.lookup('store:main');

    try {
      store.modelFor(obj.type);
    } catch (e) {
      // The record refers to a model which this version of the application
      // does not have.
      return;
    }

    var recordInStore = store.getById(obj.type, obj.id);
    if (!recordInStore) {
      // The record hasn't been loaded into the store; no need to reload its data.
      return;
    }
    if (!recordInStore.get('isLoaded') || recordInStore.get('isDirty')) {
      // The record either hasn't loaded yet or has unpersisted local changes.
      // In either case, we don't want to refresh it in the store
      // (and for some substates, attempting to do so will result in an error).
      return;
    }

    if (change.deleted) {
      store.unloadRecord(recordInStore);
    } else {
      recordInStore.reload();
    }
  },

  willDestroy: function() {
    if (this.changes) {
      this.changes.cancel();
    }
  },

  _init: function (type) {
    var self = this;
    if (!this.db || typeof this.db !== 'object') {
      throw new Error('Please set the `db` property on the adapter.');
    }

    if (!Ember.get(type, 'attributes').has('rev')) {
      var modelName = classify(type.modelName);
      throw new Error('Please add a `rev` attribute of type `string`' +
        ' on the ' + modelName + ' model.');
    }

    this._schema = this._schema || [];

    var singular = type.modelName;
    var plural = pluralize(type.modelName);

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

    if (type.documentType) {
      schemaDef['documentType'] = type.documentType;
    }

    // else it's new, so update
    this._schema.push(schemaDef);

    // check all the subtypes
    type.eachRelationship(function (_, rel) {
      if (rel.kind !== 'belongsTo' && rel.kind !== 'hasMany') {
        // TODO: support inverse as well
        return; // skip
      }
      var relDef = {};
      relDef[rel.kind] = {
        type: rel.type.modelName,
        options: rel.options
      };
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
    var serializer = store.serializerFor(type.modelName);

    var recordToStore = record;
    // In Ember-Data beta.15, we need to take a snapshot. See issue #45.
    if (
      typeof record.record === 'undefined' &&
      typeof record._createSnapshot === 'function'
    ) {
      recordToStore = record._createSnapshot();
    }

    serializer.serializeIntoHash(
      data,
      type,
      recordToStore,
      {includeId: true}
    );

    data = data[type.modelName];

    // ember sets it to null automatically. don't need it.
    if (data.rev === null) {
      delete data.rev;
    }

    return data;
  },

  findAll: function(store, type /*, sinceToken */) {
    // TODO: use sinceToken
    this._init(type);
    return this.db.rel.find(type.modelName);
  },

  findMany: function(store, type, ids) {
    this._init(type);
    return this.db.rel.find(type.modelName, ids);
  },

  findQuery: function(/* store, type, query */) {
    throw new Error(
      "findQuery not yet supported by ember-pouch. " +
      "See https://github.com/nolanlawson/ember-pouch/issues/7.");
  },

  find: function (store, type, id) {
    this._init(type);
    return this.db.rel.find(type.modelName, id).then(function (payload) {
      // Ember Data chokes on empty payload, this function throws
      // an error when the requested data is not found
      if (typeof payload === 'object' && payload !== null) {
        var singular = type.modelName;
        var plural = pluralize(type.modelName);
        var results = payload[singular] || payload[plural];
        if (results && results.length > 0) {
          return payload;
        }
      }
      throw new Error('Not found: type "' + type.modelName +
        '" with id "' + id + '"');
    });
  },

  createRecord: function(store, type, record) {
    this._init(type);
    var data = this._recordToData(store, type, record);
    return this.db.rel.save(type.modelName, data);
  },

  updateRecord: function (store, type, record) {
    this._init(type);
    var data = this._recordToData(store, type, record);
    return this.db.rel.save(type.modelName, data);
  },

  deleteRecord: function (store, type, record) {
    this._init(type);
    var data = this._recordToData(store, type, record);
    return this.db.rel.del(type.modelName, data)
      .then(extractDeleteRecord);
  }
});
