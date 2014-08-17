define("pouchdb-adapter",
  ["./pouchdb-adapter","./pouchdb-serializer","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Adapter = __dependency1__["default"] || __dependency1__;
    var Serializer = __dependency2__["default"] || __dependency2__;

    __exports__.Adapter = Adapter;
    __exports__.Serializer = Serializer;
  });
define("pouchdb-adapter/pouchdb-adapter",
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = DS.RESTAdapter.extend({

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
  });
define("pouchdb-adapter/pouchdb-serializer",
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = DS.RESTSerializer.extend({
    });
  });