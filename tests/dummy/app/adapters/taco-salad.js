import { run } from '@ember/runloop';
import { assert } from '@ember/debug';
import { isEmpty } from '@ember/utils';
import { Adapter } from 'ember-pouch';
import PouchDB from 'ember-pouch/pouchdb';
import config from 'dummy/config/environment';

function createDb() {
  let localDb = config.emberPouch.localDb;

  assert('emberPouch.localDb must be set', !isEmpty(localDb));

  let db = new PouchDB(localDb);

  if (config.emberPouch.remote) {
    let remoteDb = new PouchDB(config.emberPouch.remoteDb);

    db.sync(remoteDb, {
      live: true,
      retry: true,
    });
  }

  return db;
}

export default class TacoSaladAdapter extends Adapter {
  constructor(owner, args) {
    super(owner, args);
    this.db = createDb();
  }

  _init(store, type) {
    type.eachRelationship((name, rel) => {
      rel.options.async = config.emberPouch.async;
      if (rel.kind === 'hasMany') {
        rel.options.save = config.emberPouch.saveHasMany;
      }
    });
    if (super._init) {
      return super._init(...arguments);
    }
  }

  unloadedDocumentChanged(obj) {
    let store = this.store;
    let recordTypeName = this.getRecordTypeName(store.modelFor(obj.type));
    this.db.rel.find(recordTypeName, obj.id).then(function (doc) {
      run(function () {
        store.pushPayload(recordTypeName, doc);
      });
    });
  }
}
