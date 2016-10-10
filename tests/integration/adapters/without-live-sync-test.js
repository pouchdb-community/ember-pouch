import Ember from 'ember';
import { test } from 'qunit';
import moduleForIntegration from '../../helpers/module-for-acceptance';
import { promiseToRunLater } from '../../helpers/async';

moduleForIntegration('Integration | Adapter | Without live sync', {
  beforeEach(assert) {
    var done = assert.async();

    this.adapter = function adapter() {
      return this.store().adapterFor('hot-sauce');
    };
    this.db = function db() {
      return this.adapter().get('db');
    };
    Ember.RSVP.Promise.resolve().then(() => {
      return this.db().bulkDocs([
        { _id: 'hotSauce_2_A', data: { name: 'Cholula' } },
        { _id: 'hotSauce_2_B', data: { name: 'Melbourne Hot Sauce' } },
      ]);
    }).finally(done);
  },
  afterEach(assert) {
    var done = assert.async();
    this.db().destroy().then(() => {
      Ember.run(() => this.adapter().destroy());
      done();
    });
  }
});

test('changes are not synced', function (assert) {
  assert.expect(2);
  var done = assert.async();

  Ember.RSVP.resolve().then(() => {
    return this.store().find('hot-sauce', 'A');
  }).then((hotSauce) => {
    assert.equal('Cholula', hotSauce.get('name'),
      'the loaded instance should reflect the initial test data');

    return this.db().get('hotSauce_2_A');
  }).then((hotSauceRecord) => {
    hotSauceRecord.data.name = 'Death Sauce';
    return this.db().put(hotSauceRecord);
  }).then(() => {
    return promiseToRunLater(() => {
      var alreadyLoadedHotSauce = this.store().peekRecord('hot-sauce', 'A');
      assert.equal(alreadyLoadedHotSauce.get('name'), 'Cholula',
        'the loaded instance should not automatically reflect the change in the database');
    }, 15);
  }).finally(done);
});

test('changes can be manually synced', function (assert) {
  assert.expect(3);
  var done = assert.async();

  this.adapter().set('liveSync', false);
  Ember.RSVP.resolve().then(() => {
    return this.adapter().sync(); // perform initial sync to get update_seq
  }).then(() => {
    return this.store().find('hot-sauce', 'A');
  }).then((hotSauce) => {
    assert.equal('Cholula', hotSauce.get('name'),
      'the loaded instance should reflect the initial test data');
    return this.db().get('hotSauce_2_A');
  }).then((hotSauceRecord) => {
    hotSauceRecord.data.name = 'Death Sauce';
    return this.db().put(hotSauceRecord);
  }).then(() => {
    return this.store().find('hot-sauce', 'A');
  }).then((hotSauce) => {
    assert.equal('Cholula', hotSauce.get('name'),
      'the loaded instance does not reflect the changes');
    return this.adapter().sync();
  })
  .then(() => {
    return promiseToRunLater(() => {
      var alreadyLoadedHotSauce = this.store().peekRecord('hot-sauce', 'A');
      assert.equal(alreadyLoadedHotSauce.get('name'), 'Death Sauce',
        'the loaded instance reflects the change in the database');
    }, 500);
  }).finally(done);
});

test('changes can be synced periodically', function (assert) {
  assert.expect(3);
  var done = assert.async();

  this.adapter().set('liveSync', false);
  Ember.RSVP.resolve().then(() => {
    return this.adapter().sync(); // perform initial sync to get update_seq
  }).then(() => {
    return this.store().find('hot-sauce', 'A');
  }).then((hotSauce) => {
    assert.equal('Cholula', hotSauce.get('name'),
      'the loaded instance should reflect the initial test data');
    return this.db().get('hotSauce_2_A');
  }).then((hotSauceRecord) => {
    hotSauceRecord.data.name = 'Death Sauce';
    return this.db().put(hotSauceRecord);
  }).then(() => {
    return this.store().find('hot-sauce', 'A');
  }).then((hotSauce) => {
    assert.equal('Cholula', hotSauce.get('name'),
      'the loaded instance does not reflect the changes');
    this.adapter().set('syncInterval', 100);
  })
  .then(() => {
    return promiseToRunLater(() => {
      var alreadyLoadedHotSauce = this.store().peekRecord('hot-sauce', 'A');
      assert.equal(alreadyLoadedHotSauce.get('name'), 'Death Sauce',
        'the loaded instance reflects the change in the database');
    }, 500);
  }).finally(done);
});

