import { module } from 'qunit';
import startApp from '../helpers/start-app';
import destroyApp from '../helpers/destroy-app';
import config from 'dummy/config/environment';

import Ember from 'ember';
/* globals PouchDB Qunit */

function promiseToRunLater(callback, timeout) {
  return new Ember.RSVP.Promise((resolve) => {
    Ember.run.later(() => {
      callback();
      resolve();
    }, timeout);
  });
}

function serializePromises(promiseFactories) {
  var chain = Ember.RSVP.resolve();
  var overallRes = new Array(promiseFactories.length);
  promiseFactories.forEach(function (promiseFactory, i) {
    chain = chain.then(promiseFactories[i]).then(function (res) {
      overallRes[i] = res;
    });
  });
  return chain.then(function () {
    return overallRes;
  });
};

export default function(name, options = {}, nested = undefined) {
  module(name, {
    beforeEach(assert) {
    	//console.log('expect + 1');
      //assert.expect(1);
      var done = assert.async();

      return /*promiseToRunLater(() => {*/ Ember.RSVP.Promise.resolve().then(() => {
      	//throw "test";

      	console.log('starting1', QUnit.config.current.testName);
      	let db = new PouchDB(config.emberpouch.localDb);
      	
      	return db.getIndexes().then(data => {
      		console.log('indexes', data.indexes.length);
      		return serializePromises(data.indexes.map(
      		index => {
      			console.log(index.ddoc);
      			return index.ddoc ? (() => db.deleteIndex(index)) : (() => Ember.RSVP.resolve())
      		}));
      	}).then(() => console.log('indexes gone'))
      	.then(() => db.destroy()).then(() => console.log('destroyed', QUnit.config.current.testName));
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
        done();
      });//.finally(done);
//  }, 10);
    },

    afterEach() {
      if (this.application) {
      	console.log('stopping');
        destroyApp(this.application);
	  }

      if (options.afterEach) {
        options.afterEach.apply(this, arguments);
      }
    }
  }, nested);
}
