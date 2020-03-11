import { run } from '@ember/runloop';
import { assert } from '@ember/debug';
import { isEmpty } from '@ember/utils';
import Adapter from 'dummy/adapter';
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
        retry: true
      });
  }

  return db;
}

export default Adapter.extend({
  init() {
    this._super(...arguments);
    this.set('db', createDb());
  },
  unloadedDocumentChanged(obj) {
    let store = this.get('store');
    let recordTypeName = this.getRecordTypeName(store.modelFor(obj.type));
    this.get('db').rel.find(recordTypeName, obj.id).then(function(doc){
      run(function() {
        store.pushPayload(recordTypeName, doc);
      });
    });
  }
});
