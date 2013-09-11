DS.HALSerializer = DS.RESTSerializer.extend({
  extractSingle: function(store, type, payload, id, requestType) {
    var kind = type.typeKey;
    var resource = {};

    resource = _.extend(
      this._extractSingleProperties(payload),
      this._extractEmbeddedIds(payload));
    resource.id = this._extractResourceId(payload);

    var resource_payload = this._extractEmbeddedResources(payload);
    resource_payload[kind] = resource;

    return this._super(store, type, resource_payload, resource.id, requestType);
  },

  _extractSingleProperties: function(payload) {
    return _.object(
      _.pairs(payload).reject(function(it) {
        return it[0] === "_embedded";
      }).reject(function(it) {
        return it[0] === "_links";
      })
    );
  },

  _extractResourceId: function(payload) {
    var self_link = payload._links.self.href;

    return _.last(self_link.split("/"));
  },

  _extractEmbeddedIds: function(payload) {
    var extractId = this._extractResourceId;
    var embeds    = payload._embedded;

    return _.object(
      _.pairs(embeds).map(function(it) {
        return [it[0], it[1].map(extractId)];
      })
    );
  },

  _extractEmbeddedResources: function(payload) {
    var embeds = payload._embedded;

    return embeds;
  }
});
