import RESTAdapter from '@ember-data/adapter/rest';
import { assert } from '@ember/debug';
import { isEmpty } from '@ember/utils';
import { all, defer } from 'rsvp';
import { getOwner } from '@ember/application';
import { bind } from '@ember/runloop';
import { on } from '@ember/object/evented';
import { classify, camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';
//import BelongsToRelationship from 'ember-data/-private/system/relationships/state/belongs-to';

import {
  extractDeleteRecord,
  shouldSaveRelationship,
  configFlagDisabled,
} from '../utils';

//BelongsToRelationship.reopen({
//  findRecord() {
//    return this._super().catch(() => {
//      //not found: deleted
//      this.clear();
//    });
//  }
//});

export default class PouchAdapter extends RESTAdapter.extend({
  fixDeleteBug: true,
  coalesceFindRequests: false,

  // The change listener ensures that individual records are kept up to date
  // when the data in the database changes. This makes ember-data 2.0's record
  // reloading redundant.
  shouldReloadRecord: function () {
    return false;
  },
  shouldBackgroundReloadRecord: function () {
    return false;
  },
  _onInit: on('init', function () {
    this._startChangesToStoreListener();
  }),
  _startChangesToStoreListener: function () {
    var db = this.db;
    if (db && !this.changes) {
      // only run this once
      var onChangeListener = bind(this, 'onChange');
      this.onChangeListener = onChangeListener;
      this.changes = db.changes({
        since: 'now',
        live: true,
        returnDocs: false,
      });
      this.changes.on('change', onChangeListener);
    }
  },

  _stopChangesListener: function () {
    if (this.changes) {
      var onChangeListener = this.onChangeListener;
      this.changes.removeListener('change', onChangeListener);
      this.changes.cancel();
      this.changes = undefined;
    }
  },
  changeDb: function (db) {
    this._stopChangesListener();

    var store = this.store;
    var schema = this._schema || [];

    for (var i = 0, len = schema.length; i < len; i++) {
      store.unloadAll(schema[i].singular);
    }

    this._schema = null;
    this.db = db;
    this._startChangesToStoreListener();
  },
  onChange: function (change) {
    // If relational_pouch isn't initialized yet, there can't be any records
    // in the store to update.
    if (!this.db.rel) {
      return;
    }

    var obj = this.db.rel.parseDocID(change.id);
    // skip changes for non-relational_pouch docs. E.g., design docs.
    if (!obj.type || !obj.id || obj.type === '') {
      return;
    }

    var store = this.store;

    if (this.waitingForConsistency[change.id]) {
      let promise = this.waitingForConsistency[change.id];
      delete this.waitingForConsistency[change.id];
      if (change.deleted) {
        promise.reject('deleted');
      } else {
        promise.resolve(this._findRecord(obj.type, obj.id));
      }
      return;
    }

    try {
      store.modelFor(obj.type);
    } catch (e) {
      // The record refers to a model which this version of the application
      // does not have.
      return;
    }

    var recordInStore = store.peekRecord(obj.type, obj.id);
    if (!recordInStore) {
      // The record hasn't been loaded into the store; no need to reload its data.
      if (this.createdRecords[obj.id]) {
        delete this.createdRecords[obj.id];
      } else {
        this.unloadedDocumentChanged(obj);
      }
      return;
    }
    if (
      !recordInStore.get('isLoaded') ||
      recordInStore.get('rev') === change.changes[0].rev ||
      recordInStore.get('hasDirtyAttributes')
    ) {
      // The record either hasn't loaded yet or has unpersisted local changes.
      // In either case, we don't want to refresh it in the store
      // (and for some substates, attempting to do so will result in an error).
      // We also ignore the change if we already have the latest revision
      return;
    }

    if (change.deleted) {
      if (this.fixDeleteBug) {
        if (
          recordInStore._internalModel._recordData &&
          recordInStore._internalModel._recordData.setIsDeleted
        ) {
          recordInStore._internalModel._recordData.setIsDeleted(true);
        }
        recordInStore._internalModel.transitionTo('deleted.saved'); //work around ember-data bug
      } else {
        store.unloadRecord(recordInStore);
      }
    } else {
      recordInStore.reload();
    }
  },

  unloadedDocumentChanged: function (/* obj */) {
    /*
     * For performance purposes, we don't load records into the store that haven't previously been loaded.
     * If you want to change this, subclass this method, and push the data into the store. e.g.
     *
     *  let store = this.get('store');
     *  let recordTypeName = this.getRecordTypeName(store.modelFor(obj.type));
     *  this.get('db').rel.find(recordTypeName, obj.id).then(function(doc){
     *    store.pushPayload(recordTypeName, doc);
     *  });
     */
  },

  willDestroy: function () {
    this._stopChangesListener();
  },

  init() {
    this._indexPromises = [];
    this.waitingForConsistency = {};
    this.createdRecords = {};
  },

  _indexPromises: null,

  _init: function (store, type, indexPromises) {
    var self = this,
      recordTypeName = this.getRecordTypeName(type);
    if (!this.db || typeof this.db !== 'object') {
      throw new Error('Please set the `db` property on the adapter.');
    }

    if (!type.attributes.has('rev')) {
      var modelName = classify(recordTypeName);
      throw new Error(
        'Please add a `rev` attribute of type `string`' +
          ' on the ' +
          modelName +
          ' model.'
      );
    }

    this._schema = this._schema || [];

    var singular = recordTypeName;
    var plural = pluralize(recordTypeName);

    // check that we haven't already registered this model
    for (var i = 0, len = this._schema.length; i < len; i++) {
      var currentSchemaDef = this._schema[i];
      if (currentSchemaDef.singular === singular) {
        return all(this._indexPromises);
      }
    }

    var schemaDef = {
      singular: singular,
      plural: plural,
    };

    if (type.documentType) {
      schemaDef['documentType'] = type.documentType;
    }

    let config = getOwner(this).resolveRegistration('config:environment');
    // else it's new, so update
    this._schema.push(schemaDef);
    // check all the subtypes
    // We check the type of `rel.type`because with ember-data beta 19
    // `rel.type` switched from DS.Model to string

    var rels = []; //extra array is needed since type.relationships/byName return a Map that is not iterable
    type.eachRelationship((_relName, rel) => rels.push(rel));

    let rootCall = indexPromises == undefined;
    if (rootCall) {
      indexPromises = [];
    }

    for (let rel of rels) {
      if (rel.kind !== 'belongsTo' && rel.kind !== 'hasMany') {
        // TODO: support inverse as well
        continue; // skip
      }
      var relDef = {},
        relModel =
          typeof rel.type === 'string' ? store.modelFor(rel.type) : rel.type;
      if (relModel) {
        let includeRel = true;
        if (!('options' in rel)) rel.options = {};

        if (typeof rel.options.async === 'undefined') {
          rel.options.async =
            config.emberPouch && !isEmpty(config.emberPouch.async)
              ? config.emberPouch.async
              : true; //default true from https://github.com/emberjs/data/pull/3366
        }
        let options = Object.create(rel.options);
        if (rel.kind === 'hasMany' && !shouldSaveRelationship(self, rel)) {
          let inverse = type.inverseFor(rel.key, store);
          if (inverse) {
            if (inverse.kind === 'belongsTo') {
              indexPromises.push(
                self.get('db').createIndex({
                  index: { fields: ['data.' + inverse.name, '_id'] },
                })
              );
              if (options.async) {
                includeRel = false;
              } else {
                options.queryInverse = inverse.name;
              }
            }
          }
        }

        if (includeRel) {
          relDef[rel.kind] = {
            type: self.getRecordTypeName(relModel),
            options: options,
          };
          if (!schemaDef.relations) {
            schemaDef.relations = {};
          }
          schemaDef.relations[rel.key] = relDef;
        }

        self._init(store, relModel, indexPromises);
      }
    }

    this.db.setSchema(this._schema);

    if (rootCall) {
      this._indexPromises = this._indexPromises.concat(indexPromises);
      return all(indexPromises).then(() => {
        this._indexPromises = this._indexPromises.filter(
          (x) => !indexPromises.includes(x)
        );
      });
    }
  },

  _recordToData: function (store, type, record) {
    var data = {};
    // Though it would work to use the default recordTypeName for modelName &
    // serializerKey here, these uses are conceptually distinct and may vary
    // independently.
    var modelName = type.modelName || type.typeKey;
    var serializerKey = camelize(modelName);
    var serializer = store.serializerFor(modelName);

    serializer.serializeIntoHash(data, type, record, { includeId: true });

    data = data[serializerKey];

    // ember sets it to null automatically. don't need it.
    if (data.rev === null) {
      delete data.rev;
    }

    return data;
  },

  /**
   * Return key that conform to data adapter
   * ex: 'name' become 'data.name'
   */
  _dataKey: function (key) {
    var dataKey = 'data.' + key;
    return '' + dataKey + '';
  },

  /**
   * Returns the modified selector key to comform data key
   * Ex: selector: {name: 'Mario'} wil become selector: {'data.name': 'Mario'}
   */
  _buildSelector: function (selector) {
    var dataSelector = {};
    var selectorKeys = [];

    for (var key in selector) {
      if (Object.prototype.hasOwnProperty.call(selector, key)) {
        selectorKeys.push(key);
      }
    }

    selectorKeys.forEach(
      function (key) {
        var dataKey = this._dataKey(key);
        dataSelector[dataKey] = selector[key];
      }.bind(this)
    );

    return dataSelector;
  },

  /**
   * Returns the modified sort key
   * Ex: sort: ['series'] will become ['data.series']
   * Ex: sort: [{series: 'desc'}] will became [{'data.series': 'desc'}]
   */
  _buildSort: function (sort) {
    return sort.map(
      function (value) {
        var sortKey = {};
        if (typeof value === 'object' && value !== null) {
          for (var key in value) {
            if (Object.prototype.hasOwnProperty.call(value, key)) {
              sortKey[this._dataKey(key)] = value[key];
            }
          }
        } else {
          return this._dataKey(value);
        }
        return sortKey;
      }.bind(this)
    );
  },

  /**
   * Returns the string to use for the model name part of the PouchDB document
   * ID for records of the given ember-data type.
   *
   * This method uses the camelized version of the model name in order to
   * preserve data compatibility with older versions of ember-pouch. See
   * pouchdb-community/ember-pouch#63 for a discussion.
   *
   * You can override this to change the behavior. If you do, be aware that you
   * need to execute a data migration to ensure that any existing records are
   * moved to the new IDs.
   */
  getRecordTypeName(type) {
    return camelize(type.modelName);
  },

  findAll: async function (store, type /*, sinceToken */) {
    // TODO: use sinceToken
    await this._init(store, type);
    return this.db.rel.find(this.getRecordTypeName(type));
  },

  findMany: async function (store, type, ids) {
    await this._init(store, type);
    return this.db.rel.find(this.getRecordTypeName(type), ids);
  },

  findHasMany: async function (store, record, link, rel) {
    await this._init(store, record.type);
    let inverse = record.type.inverseFor(rel.key, store);
    if (inverse && inverse.kind === 'belongsTo') {
      return this.db.rel.findHasMany(
        camelize(rel.type),
        inverse.name,
        record.id
      );
    } else {
      let result = {};
      result[pluralize(rel.type)] = [];
      return result; //data;
    }
  },

  query: async function (store, type, query) {
    await this._init(store, type);

    var recordTypeName = this.getRecordTypeName(type);
    var db = this.db;

    var queryParams = {
      selector: this._buildSelector(query.filter),
    };

    if (!isEmpty(query.sort)) {
      queryParams.sort = this._buildSort(query.sort);
    }

    if (!isEmpty(query.limit)) {
      queryParams.limit = query.limit;
    }

    if (!isEmpty(query.skip)) {
      queryParams.skip = query.skip;
    }

    let pouchRes = await db.find(queryParams);
    return db.rel.parseRelDocs(recordTypeName, pouchRes.docs);
  },

  queryRecord: async function (store, type, query) {
    let results = await this.query(store, type, query);
    let recordType = this.getRecordTypeName(type);
    let recordTypePlural = pluralize(recordType);
    if (results[recordTypePlural].length > 0) {
      results[recordType] = results[recordTypePlural][0];
    } else {
      results[recordType] = null;
    }
    delete results[recordTypePlural];
    return results;
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

  findRecord: async function (store, type, id) {
    await this._init(store, type);
    var recordTypeName = this.getRecordTypeName(type);
    return this._findRecord(recordTypeName, id);
  },

  async _findRecord(recordTypeName, id) {
    let payload = await this.db.rel.find(recordTypeName, id);
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

    if (configFlagDisabled(this, 'eventuallyConsistent'))
      throw new Error(
        "Document of type '" +
          recordTypeName +
          "' with id '" +
          id +
          "' not found."
      );
    else return this._eventuallyConsistent(recordTypeName, id);
  },

  //TODO: cleanup promises on destroy or db change?
  waitingForConsistency: null,
  _eventuallyConsistent: function (type, id) {
    let pouchID = this.db.rel.makeDocID({ type, id });
    let defered = defer();
    this.waitingForConsistency[pouchID] = defered;

    return this.db.rel.isDeleted(type, id).then((deleted) => {
      //TODO: should we test the status of the promise here? Could it be handled in onChange already?
      if (deleted) {
        delete this.waitingForConsistency[pouchID];
        throw new Error(
          "Document of type '" + type + "' with id '" + id + "' is deleted."
        );
      } else if (deleted === null) {
        return defered.promise;
      } else {
        assert('Status should be existing', deleted === false);
        //TODO: should we reject or resolve the promise? or does JS GC still clean it?
        if (this.waitingForConsistency[pouchID]) {
          delete this.waitingForConsistency[pouchID];
          return this._findRecord(type, id);
        } else {
          //findRecord is already handled by onChange
          return defered.promise;
        }
      }
    });
  },

  createdRecords: null,
  createRecord: async function (store, type, record) {
    await this._init(store, type);
    var data = this._recordToData(store, type, record);
    let rel = this.db.rel;

    let id = data.id;
    if (!id) {
      id = data.id = rel.uuid();
    }
    this.createdRecords[id] = true;

    let typeName = this.getRecordTypeName(type);
    try {
      let saved = await rel.save(typeName, data);
      Object.assign(data, saved);
      let result = {};
      result[pluralize(typeName)] = [data];
      return result;
    } catch (e) {
      delete this.createdRecords[id];
      throw e;
    }
  },

  updateRecord: async function (store, type, record) {
    await this._init(store, type);
    var data = this._recordToData(store, type, record);
    let typeName = this.getRecordTypeName(type);
    let saved = await this.db.rel.save(typeName, data);
    Object.assign(data, saved); //TODO: could only set .rev
    let result = {};
    result[pluralize(typeName)] = [data];
    return result;
  },

  deleteRecord: async function (store, type, record) {
    await this._init(store, type);
    var data = this._recordToData(store, type, record);
    return this.db.rel
      .del(this.getRecordTypeName(type), data)
      .then(extractDeleteRecord);
  },
}) {}
