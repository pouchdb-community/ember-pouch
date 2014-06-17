define(
  ["./hal-serializer","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var HALSerializer = __dependency1__["default"] || __dependency1__;

    __exports__["default"] = DS.RESTAdapter.extend({
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
  });