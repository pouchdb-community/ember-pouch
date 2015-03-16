define("ember-pouch",
  ["./pouchdb-adapter","./pouchdb-serializer","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Adapter = __dependency1__["default"] || __dependency1__;
    var Serializer = __dependency2__["default"] || __dependency2__;

    __exports__.Adapter = Adapter;
    __exports__.Serializer = Serializer;
  });
define("ember-pouch/pouchdb-adapter",
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = DS.RESTAdapter.extend({

      //db: new PouchDB('http://localhost:5984/ember-todo'),

      coalesceFindRequests: true,

      init: function () {
        this._super();
        this._startChangesToStoreListener();
      },

      _startChangesToStoreListener: function () {
        this.changes = this.db.changes({
          since: 'now',
          live: true,
          returnDocs: false
        }).on('change', function (change) {
          Ember.run(function () {
            // If relational_pouch isn't initialized yet, there can't be any records
            // in the store to update.
            if (!this.db.rel) { return; }

            var obj = this.db.rel.parseDocID(change.id);
            // skip changes for non-relational_pouch docs. E.g., design docs.
            if (!obj.type || !obj.id || obj.type === '') { return; }

            var store = this.container.lookup('store:main');

            var recordInStore = store.getById(obj.type, obj.id);
            if (!recordInStore) {
              // The record hasn't been loaded into the store; no need to reload its data.
              return;
            }
            if (!recordInStore.get('isLoaded') || recordInStore.get('isDirty')) {
              // The record either hasn't loaded yet or has unpersisted local changes.
              // In either case, we don't want to refresh it in the store
              // (and for some substates, attempting to do so will result in an error).
              return;
            }

            if (change.deleted) {
              store.unloadRecord(recordInStore);
            } else {
              recordInStore.reload();
            }
          }.bind(this));
        }.bind(this));
      },

      willDestroy: function() {
        if (this.changes) {
          this.changes.cancel();
        }
      },

      _init: function (type) {
        var self = this;
        if (!this.db || typeof this.db !== 'object') {
          throw new Error('Please set the `db` property on the adapter.');
        }

        if (!Ember.get(type, 'attributes').has('rev')) {
          var modelName = Ember.String.classify(type.typeKey);
          throw new Error('Please add a `rev` attribute of type `string`' +
            ' on the ' + modelName + ' model.');
        }

        this._schema = this._schema || [];

        var singular = type.typeKey;
        var plural = Ember.String.pluralize(type.typeKey);

        // check that we haven't already registered this model
        for (var i = 0, len = this._schema.length; i < len; i++) {
          var currentSchemaDef = this._schema[i];
          if (currentSchemaDef.singular === singular) {
            return;
          }
        }

        var schemaDef = {
          singular: singular,
          plural: plural
        };

        if (type.documentType) {
          schemaDef['documentType'] = type.documentType;
        }

        // else it's new, so update
        this._schema.push(schemaDef);

        // check all the subtypes
        type.eachRelationship(function (_, rel) {
          if (rel.kind !== 'belongsTo' && rel.kind !== 'hasMany') {
            // TODO: support inverse as well
            return; // skip
          }
          var relDef = {};
          relDef[rel.kind] = {
            type: rel.type.typeKey,
            options: rel.options
          };
          if (!schemaDef.relations) {
            schemaDef.relations = {};
          }
          schemaDef.relations[rel.key] = relDef;
          self._init(rel.type);
        });

        this.db.setSchema(this._schema);
      },

      _recordToData: function (store, type, record) {
        var data = {};
        var serializer = store.serializerFor(type.typeKey);

        var recordToStore = record;
        // In Ember-Data beta.15, we need to take a snapshot. See issue #45.
        if (typeof record._createSnapshot === 'function') {
          recordToStore = record._createSnapshot();
        }

        serializer.serializeIntoHash(data, type, recordToStore, { includeId: true });

        data = data[type.typeKey];

        // ember sets it to null automatically. don't need it.
        if (data.rev === null) {
          delete data.rev;
        }

        return data;
      },

      findAll: function(store, type /*, sinceToken */) {
        // TODO: use sinceToken
        this._init(type);
        return this.db.rel.find(type.typeKey);
      },

      findMany: function(store, type, ids) {
        this._init(type);
        return this.db.rel.find(type.typeKey, ids);
      },

      findQuery: function(/* store, type, query */) {
        throw new Error(
          "findQuery not yet supported by ember-pouch. " +
          "See https://github.com/nolanlawson/ember-pouch/issues/7.");
      },

      find: function (store, type, id) {
        this._init(type);
        return this.db.rel.find(type.typeKey, id).then(function (payload) {
          // Ember Data chokes on empty payload, this function throws
          // an error when the requested data is not found
          if (typeof payload === 'object' && payload !== null) {
            var singular = type.typeKey;
            var plural = Ember.String.pluralize(type.typeKey);
            var results = payload[singular] || payload[plural];
            if (results && results.length > 0) {
              return payload;
            }
          }
          throw new Error('Not found: type "' + type.typeKey +
            '" with id "' + id + '"');
        });
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
  });
define("ember-pouch/pouchdb-serializer",
  ["exports"],
  function(__exports__) {
    "use strict";
    __exports__["default"] = DS.RESTSerializer.extend({
    });
  });