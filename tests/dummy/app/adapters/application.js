import { Adapter } from 'ember-pouch/index';
import PouchDB from 'pouchdb';
import config from 'dummy/config/environment';
import Ember from 'ember';

const { assert, isEmpty } = Ember;

function createDb() {
  let localDb = config.emberpouch.localDb;

  assert('emberpouch.localDb must be set', !isEmpty(localDb));

  let db = new PouchDB(localDb);

  if (config.emberpouch.remote) {
      let remoteDb = new PouchDB(config.emberpouch.remoteDb);

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
