"use strict";
var HALSerializer = require("./hal-serializer")["default"] || require("./hal-serializer");

exports["default"] = DS.RESTAdapter.extend({
  defaultSerializer: HALSerializer,

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
  }
});