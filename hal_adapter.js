DS.HALAdapter = DS.RESTAdapter.extend({
  defaultSerializer: DS.HALSerializer,

  find: function(store, type, id) {
    return this.ajax(id, 'GET');
  }
});
