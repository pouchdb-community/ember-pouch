import { test } from 'qunit';
import DS from 'ember-data';
import moduleForIntegration from '../../helpers/module-for-pouch-acceptance';

import Ember from 'ember';

/*
 * Tests basic CRUD behavior for an app using the ember-pouch adapter.
 */

moduleForIntegration('Integration | Adapter | Basic CRUD Ops');

test('can find all', function (assert) {
  assert.expect(3);

  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    return this.db().bulkDocs([
      { _id: 'tacoSoup_2_A', data: { flavor: 'al pastor' } },
      { _id: 'tacoSoup_2_B', data: { flavor: 'black bean' } },
      { _id: 'burritoShake_2_X', data: { consistency: 'smooth' } }
    ]);
  }).then(() => {
    return this.store().findAll('taco-soup');
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
    return this.db().bulkDocs([
      { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor' } },
      { _id: 'tacoSoup_2_D', data: { flavor: 'black bean' } },
    ]);
  }).then(() => {
    return this.store().find('taco-soup', 'D');
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

test('can query with sort', function (assert) {
  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    return this.db().createIndex({ index: {
      fields: ['data.name'] }
    }).then(() => {
      return this.db().bulkDocs([
        { _id: 'smasher_2_mario', data: { name: 'Mario', series: 'Mario', debut: 1981 }},
        { _id: 'smasher_2_puff', data: { name: 'Jigglypuff', series: 'Pokemon', debut: 1996 }},
        { _id: 'smasher_2_link', data: { name: 'Link', series: 'Zelda', debut: 1986 }},
        { _id: 'smasher_2_dk', data: { name: 'Donkey Kong', series: 'Mario', debut: 1981 }},
        { _id: 'smasher_2_pika', data: { name: 'Pikachu', series: 'Pokemon', _id: 'pikachu', debut: 1996 }}
      ]);
    });
  }).then(() => {
    return this.store().query('smasher', {
      filter: {name: {$gt: ''}},
      sort: ['name']
    });
  }).then((found) => {
    assert.equal(found.get('length'), 5, 'should returns all the smashers ');
    assert.deepEqual(found.mapBy('id'), ['dk','puff','link','mario','pika'],
      'should have extracted the IDs correctly');
    assert.deepEqual(found.mapBy('name'), ['Donkey Kong', 'Jigglypuff', 'Link', 'Mario','Pikachu'],
      'should have extracted the attributes also');
    done();
  }).catch((error) => {
    console.error('error in test', error);
    assert.ok(false, 'error in test:' + error);
    done();
  });
});

test('can query multi-field queries', function (assert) {
  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    return this.db().createIndex({ index: {
      fields: ['data.series', 'data.debut'] }
    }).then(() => {
      return this.db().bulkDocs([
        { _id: 'smasher_2_mario', data: { name: 'Mario', series: 'Mario', debut: 1981 }},
        { _id: 'smasher_2_puff', data: { name: 'Jigglypuff', series: 'Pokemon', debut: 1996 }},
        { _id: 'smasher_2_link', data: { name: 'Link', series: 'Zelda', debut: 1986 }},
        { _id: 'smasher_2_dk', data: { name: 'Donkey Kong', series: 'Mario', debut: 1981 }},
        { _id: 'smasher_2_pika', data: { name: 'Pikachu', series: 'Pokemon', _id: 'pikachu', debut: 1996 }}
      ]);
    });
  }).then(() => {
    return this.store().query('smasher', {
      filter: {series: 'Mario' },
      sort: [
        {series: 'desc'},
        {debut: 'desc'}]
    });
  }).then((found) => {
    assert.equal(found.get('length'), 2, 'should have found the two smashers');
    assert.deepEqual(found.mapBy('id'), ['mario', 'dk'],
      'should have extracted the IDs correctly');
    assert.deepEqual(found.mapBy('name'), ['Mario', 'Donkey Kong'],
      'should have extracted the attributes also');
    done();
  }).catch((error) => {
    console.error('error in test', error);
    assert.ok(false, 'error in test:' + error);
    done();
  });
});

test('can query one record', function (assert) {
  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    return this.db().createIndex({ index: {
      fields: ['data.flavor'] }
    }).then(() => {
      return this.db().bulkDocs([
        { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor', ingredients: ['X', 'Y'] } },
        { _id: 'tacoSoup_2_D', data: { flavor: 'black bean', ingredients: ['Z'] } },
        { _id: 'foodItem_2_X', data: { name: 'pineapple' }},
        { _id: 'foodItem_2_Y', data: { name: 'pork loin' }},
        { _id: 'foodItem_2_Z', data: { name: 'black beans' }}
      ]);
    });
  }).then(() => {
    return this.store().queryRecord('taco-soup', {
      filter: {flavor: 'al pastor' }
    });
  }).then((found) => {
    assert.equal(found.get('flavor'), 'al pastor',
      'should have found the requested item');
    done();
  }).catch((error) => {
    console.error('error in test', error);
    assert.ok(false, 'error in test:' + error);
    done();
  });
});

test('can query one associated records', function (assert) {
  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    return this.db().createIndex({ index: {
      fields: ['data.flavor'] }
    }).then(() => {
      return this.db().bulkDocs([
        { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor', ingredients: ['X', 'Y'] } },
        { _id: 'tacoSoup_2_D', data: { flavor: 'black bean', ingredients: ['Z'] } },
        { _id: 'foodItem_2_X', data: { name: 'pineapple' }},
        { _id: 'foodItem_2_Y', data: { name: 'pork loin' }},
        { _id: 'foodItem_2_Z', data: { name: 'black beans' }}
      ]);
    });
  }).then(() => {
    return this.store().queryRecord('taco-soup', {
      filter: {flavor: 'al pastor' }});
  }).then((found) => {
    assert.equal(found.get('flavor'), 'al pastor',
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

test('can find associated records', function (assert) {
  assert.expect(3);

  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    return this.db().bulkDocs([
      { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor', ingredients: ['X', 'Y'] } },
      { _id: 'tacoSoup_2_D', data: { flavor: 'black bean', ingredients: ['Z'] } },
      { _id: 'foodItem_2_X', data: { name: 'pineapple' }},
      { _id: 'foodItem_2_Y', data: { name: 'pork loin' }},
      { _id: 'foodItem_2_Z', data: { name: 'black beans' }}
    ]);
  }).then(() => {
    return this.store().find('taco-soup', 'C');
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
    var newSoup = this.store().createRecord('taco-soup', { id: 'E', flavor: 'balsamic' });
    return newSoup.save();
  }).then(() => {
    return this.db().get('tacoSoup_2_E');
  }).then((newDoc) => {
    assert.equal(newDoc.data.flavor, 'balsamic', 'should have saved the attribute');

    var recordInStore = this.store().peekRecord('tacoSoup', 'E');
    assert.equal(newDoc._rev, recordInStore.get('rev'),
      'should have associated the ember-data record with the rev for the new record');

    done();
  }).catch((error) => {
    console.error('error in test', error);
    assert.ok(false, 'error in test:' + error);
    done();
  });
});

test('creating an associated record stores a reference to it in the parent', function (assert) {
  assert.expect(1);

  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    return this.db().bulkDocs([
      { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor', ingredients: [] } }
    ]);
  }).then(() => {
    return this.store().findRecord('taco-soup', 'C');
  }).then(tacoSoup => {
    var newIngredient = this.store().createRecord('food-item', {
      name: 'pineapple',
      soup: tacoSoup
    });

    return newIngredient.save().then(() => tacoSoup.save());
  }).then(() => {
    this.store().unloadAll();

    return this.store().findRecord('taco-soup', 'C');
  }).then(tacoSoup => {
    return tacoSoup.get('ingredients');
  }).then(foundIngredients => {
    assert.deepEqual(foundIngredients.mapBy('name'), ['pineapple'],
      'should have fully loaded the associated items');
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
      return this.db().bulkDocs([
        { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor' } },
        { _id: 'tacoSoup_2_D', data: { flavor: 'black bean' } },
      ]);
    }).then(() => {
      return this.store().find('taco-soup', 'C');
    }).then((found) => {
      found.set('flavor', 'pork');
      return found.save();
    }).then(() => {
      return this.db().get('tacoSoup_2_C');
    }).then((updatedDoc) => {
      assert.equal(updatedDoc.data.flavor, 'pork', 'should have updated the attribute');

      var recordInStore = this.store().peekRecord('tacoSoup', 'C');
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
    return this.db().bulkDocs([
      { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor' } },
      { _id: 'tacoSoup_2_D', data: { flavor: 'black bean' } },
    ]);
  }).then(() => {
    return this.store().find('taco-soup', 'C');
  }).then((found) => {
    return found.destroyRecord();
  }).then(() => {
    return this.db().get('tacoSoup_2_C');
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
