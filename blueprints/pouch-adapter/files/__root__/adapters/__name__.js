import config from '<%= dasherizedPackageName %>/config/environment';
import { Adapter } from 'ember-pouch';
import { assert } from '@ember/debug';
import { isEmpty } from '@ember/utils';

import PouchDB from 'pouchdb-core';
import PouchDBFind from 'pouchdb-find';
import PouchDBRelational from 'relational-pouch';
import indexeddb from 'pouchdb-adapter-indexeddb';
import HttpPouch from 'pouchdb-adapter-http';
import mapreduce from 'pouchdb-mapreduce';
import replication from 'pouchdb-replication';

PouchDB
  .plugin(PouchDBFind)
  .plugin(PouchDBRelational)
  .plugin(indexeddb)
  .plugin(HttpPouch)
  .plugin(mapreduce)
  .plugin(replication)
  ;

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
