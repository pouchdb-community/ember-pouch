import Ember from 'ember';
import PouchDB from 'pouchdb';
import config from '<%= dasherizedPackageName %>/config/environment';
const { assert, isEmpty } = Ember;

export default Ember.Service.extend({
  db:null,
  init(){
    this._super(...arguments);
    this.setup()
  },
  setup(){
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
    this.set('db',db);
  }
});
