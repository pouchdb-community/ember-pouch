import { Adapter } from 'ember-pouch/index';
import PouchDB from 'pouchdb';
import config from 'dummy/config/environment';

function createDb() {
  let db = new PouchDB(config.emberpouch.name);

  if (config.emberpouch.remote) {
      let remote = new PouchDB(config.emberpouch.remote);

      db.sync(remote, {
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
