DS.HALSerializer = DS.RESTSerializer.extend({
  extractSingle: function(store, type, payload, id, requestType) {
    var kind = type.typeKey;
    var normalizedPayload     = this._normalizeRootResource(kind, payload);
    var embeddedResources     = this._extractEmbeddedResources(payload);
    var flatEmbeddedResources = this._flattenRelations(embeddedResources);
    var merged = _.extend(normalizedPayload, flatEmbeddedResources);
    var normalizedEmbeddedResources = this._normalizeEmbeddedIds(merged);

    return this._super(store, type, normalizedEmbeddedResources, id, requestType);
  },

  normalizeId: function(hash) {
    hash.id = hash._links.self.href;

    return hash;
  },

  _normalizeRootResource: function(type, payload) {
    var plural =  Ember.String.pluralize(type);

    if (paylay.hasOwnProperty(plural)) return payload;

    var resource = {};
    resource[Ember.String.pluralize(typeKey)] = [payload];

    return resource;
  },

  _normalizeEmbeddedIds: function(payload) {
    var serializerScope = this;

    _.each(payload, function(resources, relation) {
      var ids = _.map(resources, function(resource) {
        if (!resource.hasOwnProperty("_embedded")) return resource;
        serializerScope;

        var ids = _.map(resource._embedded, function(embedded, relation) {
          if (!_.isArray(embedded)) embedded = [embedded];
          var mapped = {};

          var mappedIds = _.map(embedded, serializerScope._extractResourceId);
          mapped[relation] = mappedIds;

          return mapped;
        });
        var reduced = _.reduce(ids, function(a,b) { return _.merge(a,b) });

        _.extend(resource, reduced);
      });
    });

    return payload;
  },

  _flattenRelations: function(relations) {
    var flattened = {};

    _.each(relations, function(embeds) {
      _.each(embeds, function(relation_embeds, relation) {
        flattened[relation] = (flattened[relation] || []).concat(relation_embeds);
      })
    })

    return flattened;
  },

  _extractEmbeddedResources: function(payload) {
    return _.walk.pluckRec(payload, "_embedded");
  },

  _extractResourceId: function(payload) {
    var self_link = payload._links.self.href;

    return self_link;
  }
});
