import { module, test } from 'qunit';
import startApp from '../../helpers/start-app';
import config from 'dummy/config/environment';

import Ember from 'ember';
/* globals PouchDB */

var App;

/*
 * Tests basic CRUD behavior for an app using the ember-pouch adapter.
 */

module('adapter:pouch [integration]', {
  beforeEach: function (assert) {
    var done = assert.async();

    (new PouchDB(config.emberpouch.localDb)).destroy().then(() => {
      App = startApp();
      var bootPromise;
      Ember.run(() => {
        if (App.boot) {
          App.advanceReadiness();
          bootPromise = App.boot();
        } else {
          bootPromise = Ember.RSVP.Promise.resolve();
        }
      });
      return bootPromise;
    }).then(() => {
      done();
    });
  },

  afterEach: function () {
    Ember.run(App, 'destroy');
  }
});

function db() {
  return adapter().get('db');
}

function adapter() {
  // the default adapter in the dummy app is an ember-pouch adapter
  return App.__container__.lookup('adapter:application');
}

function store() {
  return App.__container__.lookup('service:store');
}

test('can find all', function (assert) {
  assert.expect(3);

  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    return db().bulkDocs([
      { _id: 'tacoSoup_2_A', data: { flavor: 'al pastor' } },
      { _id: 'tacoSoup_2_B', data: { flavor: 'black bean' } },
      { _id: 'burritoShake_2_X', data: { consistency: 'smooth' } }
    ]);
  }).then(() => {
    return store().findAll('taco-soup');
  }).then((found) => {
    assert.equal(found.get('length'), 2, 'should have found the two taco soup items only');
    assert.deepEqual(found.mapBy('id'), ['A', 'B'],
      'should have extracted the IDs correctly');
    assert.deepEqual(found.mapBy('flavor'), ['al pastor', 'black bean'],
      'should have extracted the attributes also');
    done();
  }).catch((error) => {
    console.error('error in test', error);
    assert.ok(false, 'error in test:' + error);
    done();
  });
});

test('can find one', function (assert) {
  assert.expect(2);

  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    return db().bulkDocs([
      { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor' } },
      { _id: 'tacoSoup_2_D', data: { flavor: 'black bean' } },
    ]);
  }).then(() => {
    return store().find('taco-soup', 'D');
  }).then((found) => {
    assert.equal(found.get('id'), 'D',
      'should have found the requested item');
    assert.deepEqual(found.get('flavor'), 'black bean',
      'should have extracted the attributes also');
    done();
  }).catch((error) => {
    console.error('error in test', error);
    assert.ok(false, 'error in test:' + error);
    done();
  });
});

test('can find associated records', function (assert) {
  assert.expect(3);

  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    return db().bulkDocs([
      { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor', ingredients: ['X', 'Y'] } },
      { _id: 'tacoSoup_2_D', data: { flavor: 'black bean', ingredients: ['Z'] } },
      { _id: 'foodItem_2_X', data: { name: 'pineapple' }},
      { _id: 'foodItem_2_Y', data: { name: 'pork loin' }},
      { _id: 'foodItem_2_Z', data: { name: 'black beans' }}
    ]);
  }).then(() => {
    return store().find('taco-soup', 'C');
  }).then((found) => {
    assert.equal(found.get('id'), 'C',
      'should have found the requested item');
    return found.get('ingredients');
  }).then((foundIngredients) => {
    assert.deepEqual(foundIngredients.mapBy('id'), ['X', 'Y'],
      'should have found both associated items');
    assert.deepEqual(foundIngredients.mapBy('name'), ['pineapple', 'pork loin'],
      'should have fully loaded the associated items');
    done();
  }).catch((error) => {
    console.error('error in test', error);
    assert.ok(false, 'error in test:' + error);
    done();
  });
});

test('create a new record', function (assert) {
  assert.expect(2);

  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    var newSoup = store().createRecord('taco-soup', { id: 'E', flavor: 'balsamic' });
    return newSoup.save();
  }).then(() => {
    return db().get('tacoSoup_2_E');
  }).then((newDoc) => {
    assert.equal(newDoc.data.flavor, 'balsamic', 'should have saved the attribute');

    var recordInStore = store().peekRecord('tacoSoup', 'E');
    assert.equal(newDoc._rev, recordInStore.get('rev'),
      'should have associated the ember-data record with the rev for the new record');

    done();
  }).catch((error) => {
    console.error('error in test', error);
    assert.ok(false, 'error in test:' + error);
    done();
  });
});

// This test fails due to a bug in ember data
// (https://github.com/emberjs/data/issues/3736)
// starting with ED v2.0.0-beta.1. It works again with ED v2.1.0.
if (!DS.VERSION.match(/^2\.0/)) {
  test('update an existing record', function (assert) {
    assert.expect(2);

    var done = assert.async();
    Ember.RSVP.Promise.resolve().then(() => {
      return db().bulkDocs([
        { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor' } },
        { _id: 'tacoSoup_2_D', data: { flavor: 'black bean' } },
      ]);
    }).then(() => {
      return store().find('taco-soup', 'C');
    }).then((found) => {
      found.set('flavor', 'pork');
      return found.save();
    }).then(() => {
      return db().get('tacoSoup_2_C');
    }).then((updatedDoc) => {
      assert.equal(updatedDoc.data.flavor, 'pork', 'should have updated the attribute');

      var recordInStore = store().peekRecord('tacoSoup', 'C');
      assert.equal(updatedDoc._rev, recordInStore.get('rev'),
        'should have associated the ember-data record with the updated rev');

      done();
    }).catch((error) => {
      console.error('error in test', error);
      assert.ok(false, 'error in test:' + error);
      done();
    });
  });
}

test('delete an existing record', function (assert) {
  assert.expect(1);

  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    return db().bulkDocs([
      { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor' } },
      { _id: 'tacoSoup_2_D', data: { flavor: 'black bean' } },
    ]);
  }).then(() => {
    return store().find('taco-soup', 'C');
  }).then((found) => {
    return found.destroyRecord();
  }).then(() => {
    return db().get('tacoSoup_2_C');
  }).then((doc) => {
    assert.ok(!doc, 'document should no longer exist');
  }, (result) => {
    assert.equal(result.status, 404, 'document should no longer exist');
    done();
  }).catch((error) => {
    console.error('error in test', error);
    assert.ok(false, 'error in test:' + error);
    done();
  });
});
