export default DS.RESTSerializer.extend({
  normalize: function(type, hash, property) {
    for (var prop in hash) {
      if (prop == '_links' ||
          prop == '_embedded' ||
          prop.indexOf('http') === 0) {
        continue;
      }

      var camelizedProp = prop.camelize();
      if (prop != camelizedProp)
      {
        hash[camelizedProp] = hash[prop];
        delete hash[prop];
      }
    }

    return this._super(type, hash, property);
  },

  normalizePayload: function(type, payload) {
    var normalizedPayload;

    if (type) {
      normalizedPayload = this._normalizeRootResource(type.typeKey, payload);
    } else {
      normalizedPayload = payload;
    }

    var embeddedResources     = this._extractEmbeddedResources(payload);
    var flatEmbeddedResources = this._flattenRelations(embeddedResources);
    var merged = _.extend(normalizedPayload, flatEmbeddedResources);
    var normalizedEmbeddedResources = this._normalizeEmbeddedIds(merged);

    return normalizedEmbeddedResources;
  },

  normalizeId: function(hash) {
    hash.id = hash._links.self.href;

    return hash;
  },

  _normalizeRootResource: function(typeKey, payload) {
    var resource = {};
    resource[typeKey] = payload;

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
        var reduced = _.reduce(ids, function(a,b) { return _.merge(a,b) }, {});

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
