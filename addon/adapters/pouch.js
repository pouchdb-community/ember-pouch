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
    camelize,
    classify
  }
} = Ember;

export default DS.RESTAdapter.extend({
  coalesceFindRequests: true,

  // The change listener ensures that individual records are kept up to date
  // when the data in the database changes. This makes ember-data 2.0's record
  // reloading redundant.
  shouldReloadRecord: function () { return false; },
  shouldBackgroundReloadRecord: function () { return false; },

  _startChangesToStoreListener: on('init', function () {
    this.changes = this.get('db').changes({
      since: 'now',
      live: true,
      returnDocs: false
    }).on('change', bind(this, 'onChange'));
  }),

  onChange: function (change) {
    // If relational_pouch isn't initialized yet, there can't be any records
    // in the store to update.
    if (!this.get('db').rel) { return; }

    var obj = this.get('db').rel.parseDocID(change.id);
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

  _init: function (store, type) {
    var self = this,
        recordTypeName = this.getRecordTypeName(type);
    if (!this.get('db') || typeof this.get('db') !== 'object') {
      throw new Error('Please set the `db` property on the adapter.');
    }

    if (!Ember.get(type, 'attributes').has('rev')) {
      var modelName = classify(recordTypeName);
      throw new Error('Please add a `rev` attribute of type `string`' +
        ' on the ' + modelName + ' model.');
    }

    this._schema = this._schema || [];

    var singular = recordTypeName;
    var plural = pluralize(recordTypeName);

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
    // We check the type of `rel.type`because with ember-data beta 19
    // `rel.type` switched from DS.Model to string
    type.eachRelationship(function (_, rel) {
      if (rel.kind !== 'belongsTo' && rel.kind !== 'hasMany') {
        // TODO: support inverse as well
        return; // skip
      }
      var relDef = {},
          relModel = (typeof rel.type === 'string' ? store.modelFor(rel.type) : rel.type);
      if (relModel) {
        relDef[rel.kind] = {
          type: self.getRecordTypeName(relModel),
          options: rel.options
        };
        if (!schemaDef.relations) {
          schemaDef.relations = {};
        }
        schemaDef.relations[rel.key] = relDef;
        self._init(store, relModel);
      }
    });

    this.get('db').setSchema(this._schema);
  },

  _recordToData: function (store, type, record) {
    var data = {};
    // Though it would work to use the default recordTypeName for modelName &
    // serializerKey here, these uses are conceptually distinct and may vary
    // independently.
    var modelName = type.modelName || type.typeKey;
    var serializerKey = camelize(modelName);
    var serializer = store.serializerFor(modelName);

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

    data = data[serializerKey];

    // ember sets it to null automatically. don't need it.
    if (data.rev === null) {
      delete data.rev;
    }

    return data;
  },

  /**
   * Returns the string to use for the model name part of the PouchDB document
   * ID for records of the given ember-data type.
   *
   * This method uses the camelized version of the model name in order to
   * preserve data compatibility with older versions of ember-pouch. See
   * nolanlawson/ember-pouch#63 for a discussion.
   *
   * You can override this to change the behavior. If you do, be aware that you
   * need to execute a data migration to ensure that any existing records are
   * moved to the new IDs.
   */
  getRecordTypeName(type) {
    if (type.modelName) {
      return camelize(type.modelName);
    } else {
      // This branch can be removed when the library drops support for
      // ember-data 1.0-beta17 and earlier.
      return type.typeKey;
    }
  },

  findAll: function(store, type /*, sinceToken */) {
    // TODO: use sinceToken
    this._init(store, type);
    return this.get('db').rel.find(this.getRecordTypeName(type));
  },

  findMany: function(store, type, ids) {
    this._init(store, type);
    return this.get('db').rel.find(this.getRecordTypeName(type), ids);
  },

  matchQuery: function (record, query) {
    for(let property in query) {
      if (query.hasOwnProperty(property)) {
        const value = query[property];
        if (Object.prototype.toString.call(value) === '[object RegExp]') {
          if (!value.test(record[property])) {
            return false;
          }
        } else if (record[property] !== value) {
          return false;
        }
      }
    }
    //all query items were matched:
    return true;
  },

  findQuery: function(store, type, query) {
    var self = this;
    this._init(store, type);
    var recordTypeName = this.getRecordTypeName(type);
    return this.db.rel.find(recordTypeName).then((res) => {
      const records = res[pluralize(recordTypeName)];
      const results = {};
      results[pluralize(recordTypeName)] = records.filter((record) => {
        return self.matchQuery(record, query);
      });
      return results;
    });
  },

  /**
   * `find` has been deprecated in ED 1.13 and is replaced by 'new store
   * methods', see: https://github.com/emberjs/data/pull/3306
   * We keep the method for backward compatibility and forward calls to
   * `findRecord`. This can be removed when the library drops support
   * for deprecated methods.
  */
  find: function (store, type, id) {
    return this.findRecord(store, type, id);
  },

  findRecord: function (store, type, id) {
    this._init(store, type);
    var recordTypeName = this.getRecordTypeName(type);
    return this.get('db').rel.find(recordTypeName, id).then(function (payload) {
      // Ember Data chokes on empty payload, this function throws
      // an error when the requested data is not found
      if (typeof payload === 'object' && payload !== null) {
        var singular = recordTypeName;
        var plural = pluralize(recordTypeName);

        var results = payload[singular] || payload[plural];
        if (results && results.length > 0) {
          return payload;
        }
      }
      throw new Error('Not found: type "' + recordTypeName +
        '" with id "' + id + '"');
    });
  },

  createRecord: function(store, type, record) {
    this._init(store, type);
    var data = this._recordToData(store, type, record);
    return this.get('db').rel.save(this.getRecordTypeName(type), data);
  },

  updateRecord: function (store, type, record) {
    this._init(store, type);
    var data = this._recordToData(store, type, record);
    return this.get('db').rel.save(this.getRecordTypeName(type), data);
  },

  deleteRecord: function (store, type, record) {
    this._init(store, type);
    var data = this._recordToData(store, type, record);
    return this.get('db').rel.del(this.getRecordTypeName(type), data)
      .then(extractDeleteRecord);
  }
});
