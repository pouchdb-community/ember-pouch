import { module } from 'qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import config from 'dummy/config/environment';

import Ember from 'ember';
/* globals PouchDB */

export default function(name, options = {}) {
  module(name, {
    beforeEach(assert) {
      var done = assert.async();

      Ember.RSVP.Promise.resolve().then(() => {
      	let db = new PouchDB(config.emberpouch.localDb);
      	return db.getIndexes().then(data => {
      		return Ember.RSVP.all(data.indexes.map(index => index.ddoc ? db.deleteIndex(index) : Ember.RSVP.resolve()));
      	}).then(() => db.destroy());
      }).then(() => {
        this.application = startApp();

        this.lookup = function (item) {
          return this.application.__container__.lookup(item);
        };

        this.store = function store() {
          return this.lookup('service:store');
        };

        // At the container level, adapters are not singletons (ember-data
        // manages them). To get the instance that the app is using, we have to
        // go through the store.
        this.adapter = function adapter() {
          return this.store().adapterFor('taco-soup');
        };

        this.db = function db() {
          return this.adapter().get('db');
        };

        if (options.beforeEach) {
          options.beforeEach.apply(this, arguments);
        }
      }).finally(done);
    },

    afterEach() {
      destroyApp(this.application);

      if (options.afterEach) {
        options.afterEach.apply(this, arguments);
      }
    }
  });
}
