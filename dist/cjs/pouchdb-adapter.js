"use strict";
exports["default"] = DS.RESTAdapter.extend({

  //db: new PouchDB('http://localhost:5984/ember-todo'),

  _init: function (type) {
    if (!this.db || typeof this.db !== 'object') {
      throw new Error('Please set the `db` property on the adapter.');
    }
    var camelized = Ember.String.camelize(type.typeKey);
    this.db.setSchema([{
      singular: camelized,
      plural: Ember.String.pluralize(camelized)
    }]);
  },

  _recordToData: function (store, type, record) {
    var data = {};
    var serializer = store.serializerFor(type.typeKey);

    serializer.serializeIntoHash(data, type, record, { includeId: true });

    data = data[type.typeKey];
    return data;
  },

  findAll: function(store, type, sinceToken) {
    this._init(type);
    return this.db.rel.find(type.typeKey);
  },

  findMany: function(store, type, ids) {
    this._init(type);
    return this.db.rel.find(type.typeKey, ids);
  },

  find: function (store, type, id) {
    this._init(type);
    return this.db.rel.find(type.typeKey, id);
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