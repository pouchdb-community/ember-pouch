import { defer } from 'rsvp';
import { assert } from '@ember/debug';
import { isEmpty } from '@ember/utils';
import Adapter from 'dummy/adapter';
import PouchDB from 'pouchdb';
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
  
  onChangeListenerTest: null,
  onChange() {
    this._super(...arguments);
    if (this.onChangeListenerTest) {
      this.onChangeListenerTest(...arguments);
    }
  },
  
  waitForChangeWithID(id) {
    let defer = defer();
    this.onChangeListenerTest = (c) => {
      if (c.id === id) {
        this.onChangeListenerTest = null;
        defer.resolve(c);
      }
    }
    return defer.promise;
  },
});
