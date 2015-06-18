import { Adapter } from 'ember-pouch/index';
import PouchDB from 'pouchdb';

function createDb() {
  return new PouchDB('ember-pouch-test');
}

export default Adapter.extend({
  init() {
    this._super(...arguments);
    this.set('db', createDb());
  }
});
