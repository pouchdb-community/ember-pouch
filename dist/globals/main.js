!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.DS=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
"use strict";
var HALSerializer = _dereq_("./hal-serializer")["default"] || _dereq_("./hal-serializer");

var HALAdapter = DS.RESTAdapter.extend({
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

exports.HALAdapter = HALAdapter;
},{"./hal-serializer":2}],2:[function(_dereq_,module,exports){
"use strict";
var HALSerializer = DS.RESTSerializer.extend({
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

exports.HALSerializer = HALSerializer;
},{}],3:[function(_dereq_,module,exports){
"use strict";
var HALAdapter = _dereq_("./hal-adapter").HALAdapter;
var HALSerializer = _dereq_("./hal-serializer").HALSerializer;

exports.HALAdapter = HALAdapter;
exports.HALSerializer = HALSerializer;
},{"./hal-adapter":1,"./hal-serializer":2}]},{},[3])
(3)
});