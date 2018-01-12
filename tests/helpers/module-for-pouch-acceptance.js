import { module } from 'qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';

import Ember from 'ember';

export default function(name, options = {}, nested = undefined) {
  module(name, {
    beforeEach() {
      return Ember.RSVP.Promise.resolve().then(() => {
        if (options.beforeEach) {
          options.beforeEach.apply(this, arguments);
        }
        
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
      });
    },

    afterEach() {     
      let db = this.db();
      return Ember.RSVP.all(this.adapter()._indexPromises)
      .then(() => {
        return db.getIndexes().then(data => {
          return Ember.RSVP.all(data.indexes.map(
            index => {
              return index.ddoc ? (db.deleteIndex(index)) : (Ember.RSVP.resolve());
            }
          ));
        })
      }).then(() => db.destroy())
        .then(() => {
          if (this.application) {
            destroyApp(this.application);
          }

          if (options.afterEach) {
            options.afterEach.apply(this, arguments);
          }    
        });
    }
  }, nested);
}
