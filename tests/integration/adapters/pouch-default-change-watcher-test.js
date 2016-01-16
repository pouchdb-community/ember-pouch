import { test } from 'qunit';
import moduleForIntegration from '../../helpers/module-for-acceptance';

import Ember from 'ember';

/*
 * Tests for the default automatic change listener.
 */

moduleForIntegration('Integration | Adapter | Default Change Watcher', {
  beforeEach(assert) {
    var done = assert.async();

    Ember.RSVP.Promise.resolve().then(() => {
      return this.db().bulkDocs([
        { _id: 'tacoSoup_2_A', data: { flavor: 'al pastor', ingredients: ['X', 'Y'] } },
        { _id: 'tacoSoup_2_B', data: { flavor: 'black bean', ingredients: ['Z'] } },
        { _id: 'foodItem_2_X', data: { name: 'pineapple' } },
        { _id: 'foodItem_2_Y', data: { name: 'pork loin' } },
        { _id: 'foodItem_2_Z', data: { name: 'black beans' } }
      ]);
    }).finally(done);
  }
});

function promiseToRunLater(callback, timeout) {
  return new Ember.RSVP.Promise((resolve) => {
    Ember.run.later(() => {
      callback();
      resolve();
    }, timeout);
  });
}

test('a loaded instance automatically reflects directly-made database changes', function (assert) {
  assert.expect(2);
  var done = assert.async();

  Ember.RSVP.resolve().then(() => {
    return this.store().find('taco-soup', 'B');
  }).then((soupB) => {
    assert.equal('black bean', soupB.get('flavor'),
      'the loaded instance should reflect the initial test data');

    return this.db().get('tacoSoup_2_B');
  }).then((soupBRecord) => {
    soupBRecord.data.flavor = 'carnitas';
    return this.db().put(soupBRecord);
  }).then(() => {
    return promiseToRunLater(() => {
      var alreadyLoadedSoupB = this.store().peekRecord('taco-soup', 'B');
      assert.equal(alreadyLoadedSoupB.get('flavor'), 'carnitas',
        'the loaded instance should automatically reflect the change in the database');
    }, 15);
  }).finally(done);
});

test('a record that is not loaded stays not loaded when it is changed', function (assert) {
  assert.expect(2);
  var done = assert.async();

  Ember.RSVP.resolve().then(() => {
    assert.equal(null, this.store().peekRecord('taco-soup', 'A'),
      'test setup: record should not be loaded already');

    return this.db().get('tacoSoup_2_A');
  }).then((soupARecord) => {
    soupARecord.data.flavor = 'barbacoa';
    return this.db().put(soupARecord);
  }).then(() => {
    return promiseToRunLater(() => {
      assert.equal(null, this.store().peekRecord('taco-soup', 'A'),
        'the corresponding instance should still not be loaded');
    }, 15);
  }).finally(done);
});

test('a new record is not automatically loaded', function (assert) {
  assert.expect(2);
  var done = assert.async();

  Ember.RSVP.resolve().then(() => {
    assert.equal(null, this.store().peekRecord('taco-soup', 'C'),
      'test setup: record should not be loaded already');

    return this.db().put({
      _id: 'tacoSoup_2_C', data: { flavor: 'sofritas' }
    });
  }).then(() => {
    return promiseToRunLater(() => {
      assert.equal(null, this.store().peekRecord('taco-soup', 'C'),
        'the corresponding instance should still not be loaded');
    }, 15);
  }).finally(done);
});

test('a deleted record is automatically unloaded', function (assert) {
  assert.expect(2);
  var done = assert.async();

  Ember.RSVP.resolve().then(() => {
    return this.store().find('taco-soup', 'B');
  }).then((soupB) => {
    assert.equal('black bean', soupB.get('flavor'),
      'the loaded instance should reflect the initial test data');

    return this.db().get('tacoSoup_2_B');
  }).then((soupBRecord) => {
    return this.db().remove(soupBRecord);
  }).then(() => {
    return promiseToRunLater(() => {
      assert.equal(null, this.store().peekRecord('taco-soup', 'B'),
        'the corresponding instance should no longer be loaded');
    }, 15);
  }).finally(done);
});

test('a change to a record with a non-relational-pouch ID does not cause an error', function (assert) {
  assert.expect(0);
  var done = assert.async();

  Ember.RSVP.resolve().then(() => {
    // do some op to cause relational-pouch to be initialized
    return this.store().find('taco-soup', 'B');
  }).then(() => {
    return this.db().put({
      _id: '_design/ingredient-use'
    });
  }).finally(done);
});

test('a change to a record of an unknown type does not cause an error', function (assert) {
  assert.expect(0);
  var done = assert.async();

  Ember.RSVP.resolve().then(() => {
    // do some op to cause relational-pouch to be initialized
    return this.store().find('taco-soup', 'B');
  }).then(() => {
    return this.db().put({
      _id: 'burritoShake_2_X', data: { consistency: 'chunky' }
    });
  }).finally(done);
});
