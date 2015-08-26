import { module, test } from 'qunit';
import startApp from '../../helpers/start-app';

import Ember from 'ember';
/* globals PouchDB */

var App;

/*
 * Tests basic CRUD behavior for an app using the ember-pouch adapter.
 */

module('adapter:pouch [integration]', {
  beforeEach: function (assert) {
    var done = assert.async();

    // TODO: do this in a way that doesn't require duplicating the name of the
    // test database here and in dummy/app/adapters/application.js. Importing
    // the adapter directly doesn't work because of what seems like a resolver
    // issue.
    (new PouchDB('ember-pouch-test')).destroy().then(() => {
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

  afterEach: function (assert) {
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
  return App.__container__.lookup('store:main');
}

test('can find all', function (assert) {
  assert.expect(4);

  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    return db().bulkDocs([
      { _id: 'tacoSoup_2_A', data: { flavor: 'al pastor', breadFlour: 'wheat'} },
      { _id: 'tacoSoup_2_B', data: { flavor: 'black bean', breadFlour: 'wheat'} },
      { _id: 'burritoShake_2_X', data: { consistency: 'smooth' } }
    ]);
  }).then(() => {
    return store().find('taco-soup');
  }).then((found) => {
    assert.equal(found.get('length'), 2, 'should have found the two taco soup items only');
    assert.deepEqual(found.mapBy('id'), ['A', 'B'],
      'should have extracted the IDs correctly');
    assert.deepEqual(found.mapBy('flavor'), ['al pastor', 'black bean'],
      'should have extracted the attributes also');
    assert.deepEqual(found.mapBy('breadFlour'), ['wheat', 'wheat'],
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

test('can find black bean tacos (query equal)', function (assert) {
  assert.expect(4);

  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    return db().bulkDocs([
      { _id: 'tacoSoup_2_A', data: { flavor: 'al pastor', breadFlour: 'wheat'} },
      { _id: 'tacoSoup_2_B', data: { flavor: 'black bean', breadFlour: 'wheat' } },
      { _id: 'tacoSoup_2_C', data: { flavor: 'red bean', breadFlour: 'wheat' } },
      { _id: 'tacoSoup_2_D', data: { flavor: 'green bean', breadFlour: 'wheat' } },
      { _id: 'tacoSoup_2_E', data: { flavor: 'black bean', breadFlour: 'barley' } },
      { _id: 'burritoShake_2_X', data: { consistency: 'smooth' } }
    ]);
  }).then(() => {
    return store().find('taco-soup', {flavor: 'black bean'});
  }).then((found) => {
    assert.equal(found.get('length'), 2, 'should have found the 2 taco soups with the black bean flavor');
    assert.deepEqual(found.mapBy('id'), ['B', 'E'],
      'should have extracted the IDs correctly');
    assert.deepEqual(found.mapBy('flavor'), ['black bean', 'black bean'],
      'should have extracted the attributes also');
    assert.deepEqual(found.mapBy('breadFlour'), ['wheat', 'barley'],
      'should have extracted the attributes also');
    done();
  }).catch((error) => {
    console.error('error in test', error);
    assert.ok(false, 'error in test:' + error);
    done();
  });
});

test('can find black bean tacos with barley breadFlour (multiple equal query)', function (assert) {
  assert.expect(4);

  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    return db().bulkDocs([
      { _id: 'tacoSoup_2_A', data: { flavor: 'al pastor', breadFlour: 'wheat'} },
      { _id: 'tacoSoup_2_B', data: { flavor: 'black bean', breadFlour: 'wheat' } },
      { _id: 'tacoSoup_2_C', data: { flavor: 'red bean', breadFlour: 'wheat' } },
      { _id: 'tacoSoup_2_D', data: { flavor: 'green bean', breadFlour: 'wheat' } },
      { _id: 'tacoSoup_2_E', data: { flavor: 'black bean', breadFlour: 'barley' } },
      { _id: 'burritoShake_2_X', data: { consistency: 'smooth' } }
    ]);
  }).then(() => {
    return store().find('taco-soup', {flavor: 'black bean', breadFlour: 'barley'});
  }).then((found) => {
    assert.equal(found.get('length'), 1, 'should have found the taco soup with the black bean flavor');
    assert.deepEqual(found.mapBy('id'), ['E'],
      'should have extracted the IDs correctly');
    assert.deepEqual(found.mapBy('flavor'), ['black bean'],
      'should have extracted the attributes also');
    assert.deepEqual(found.mapBy('breadFlour'), ['barley'],
      'should have extracted the attributes also');
    done();
  }).catch((error) => {
    console.error('error in test', error);
    assert.ok(false, 'error in test:' + error);
    done();
  });
});

test('can find any bean tacos (query regexp)', function (assert) {
  assert.expect(3);

  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    return db().bulkDocs([
      { _id: 'tacoSoup_2_A', data: { flavor: 'al pastor' } },
      { _id: 'tacoSoup_2_B', data: { flavor: 'black bean' } },
      { _id: 'tacoSoup_2_C', data: { flavor: 'red bean' } },
      { _id: 'tacoSoup_2_D', data: { flavor: 'green bean' } },
      { _id: 'burritoShake_2_X', data: { consistency: 'smooth' } }
    ]);
  }).then(() => {
    return store().find('taco-soup', {flavor: /.*bean/ });
  }).then((found) => {
    assert.equal(found.get('length'), 3, 'should have found the taco soup with the black bean flavor');
    assert.deepEqual(found.mapBy('id'), ['B', 'C', 'D'],
      'should have extracted the IDs correctly');
    assert.deepEqual(found.mapBy('flavor'), ['black bean', 'red bean', 'green bean'],
      'should have extracted the attributes also');
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
  }).then((saved) => {
    return db().get('tacoSoup_2_E');
  }).then((newDoc) => {
    assert.equal(newDoc.data.flavor, 'balsamic', 'should have saved the attribute');

    var recordInStore = store().getById('tacoSoup', 'E');
    assert.equal(newDoc._rev, recordInStore.get('rev'),
      'should have associated the ember-data record with the rev for the new record');

    done();
  }).catch((error) => {
    console.error('error in test', error);
    assert.ok(false, 'error in test:' + error);
    done();
  });
});

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
  }).then((saved) => {
    return db().get('tacoSoup_2_C');
  }).then((updatedDoc) => {
    assert.equal(updatedDoc.data.flavor, 'pork', 'should have updated the attribute');

    var recordInStore = store().getById('tacoSoup', 'C');
    assert.equal(updatedDoc._rev, recordInStore.get('rev'),
      'should have associated the ember-data record with the updated rev');

    done();
  }).catch((error) => {
    console.error('error in test', error);
    assert.ok(false, 'error in test:' + error);
    done();
  });
});

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
