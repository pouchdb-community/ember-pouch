import { Adapter } from 'ember-pouch';
import PouchDB from 'ember-pouch/pouchdb';
import config from '<%= dasherizedPackageName %>/config/environment';
import Ember from 'ember';

const { assert, isEmpty } = Ember;

function createDb() {
  let localDb = config.emberPouch.localDb;

  assert('emberPouch.localDb must be set', !isEmpty(localDb));

  let db = new PouchDB(localDb);

  if (config.emberPouch.remoteDb) {
    let remoteDb = new PouchDB(config.emberPouch.remoteDb);

    db.sync(remoteDb, {
      live: true,
      retry: true
    });
  }

  return db;
}

export default Adapter.extend({
  init() {
    this._super(...arguments);
    this.set('db', createDb());
  }
});
import config from '<%= dasherizedPackageName %>/config/environment';
import PouchDB from 'pouchdb';
import { Adapter } from 'ember-pouch';
import { assert } from '@ember/debug';

export default class ApplicationAdapter extends Adapter {

  constructor() {
    super(...arguments);

    const localDb = config.emberPouch.localDb;

    assert('emberPouch.localDb must be set', !isEmpty(localDb));

    const db = new PouchDB(localDb);
    this.db = db;

    // If we have specified a remote CouchDB instance, then replicate our local database to it
    if (config.emberPouch.remoteDb) {
      let remoteDb = new PouchDB(config.emberPouch.remoteDb);

      db.sync(remoteDb, {
        live: true,
        retry: true
      });
    }

    return this;
  }

  unloadedDocumentChanged(obj) {
    let recordTypeName = this.getRecordTypeName(this.store.modelFor(obj.type));
    this.db.rel.find(recordTypeName, obj.id).then((doc) => {
      this.store.pushPayload(recordTypeName, doc);
    });
  }
}
