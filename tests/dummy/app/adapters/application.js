import Adapter from 'dummy/adapter';
import PouchDB from 'ember-pouch/pouchdb';
import config from 'dummy/config/environment';
import Ember from 'ember';

const { assert, isEmpty } = Ember;

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
    let defer = Ember.RSVP.defer();
    this.onChangeListenerTest = (c) => {
      if (c.id === id) {
        this.onChangeListenerTest = null;
        defer.resolve(c);
      }
    }
    return defer.promise;
  },
});
