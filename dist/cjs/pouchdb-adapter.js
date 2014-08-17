"use strict";
exports["default"] = DS.RESTAdapter.extend({

  /*init: function() {
    if (!this.db || typeof this.db !== 'object') {
      throw new Error('Please set the `db` property on the adapter.');
    }
  },*/
  /*
  find: function(store, type, id) {
    return this.ajax(id, 'GET');
  },

  updateRecord: function(store, type, record) {
    var data = {};
    var serializer = store.serializerFor(type.typeKey);

    serializer.serializeIntoHash(data, type, record);

    return this.ajax(record.id, "PUT", { data: data });
  },

  deleteRecord: function(store, type, record) {
    return this.ajax(record.id, "DELETE");
  }*/
});