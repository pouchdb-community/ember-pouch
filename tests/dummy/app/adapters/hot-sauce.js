import { Adapter } from 'ember-pouch/index';
import PouchDB from 'pouchdb';

function createDb() {
  return new PouchDB('hot-sauces');
}

export default Adapter.extend({
  liveSync: false,
  init() {
    this._super(...arguments);
    this.set('db', createDb());
  }
});
