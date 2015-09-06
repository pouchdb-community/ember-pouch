import { Adapter } from 'ember-pouch/index';
import PouchDB from 'pouchdb';
import config from 'dummy/config/environment';

function createDb() {
  return new PouchDB(config.emberpouch.name);
}

export default Adapter.extend({
  init() {
    this._super(...arguments);
    this.set('db', createDb());
  }
});
