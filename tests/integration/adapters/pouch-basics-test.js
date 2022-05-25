import { later, run } from '@ember/runloop';
import { Promise, all } from 'rsvp';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

import DS from 'ember-data';
import moduleForIntegration from '../../helpers/module-for-pouch-acceptance';

import config from 'dummy/config/environment';

function promiseToRunLater(timeout) {
  return new Promise((resolve) => {
    later(() => {
      resolve();
    }, timeout);
  });
}

//function delayPromise(timeout) {
//  return function(res) {
//    return promiseToRunLater(timeout).then(() => res);
//  }
//}

function savingHasMany() {
  return config.emberPouch.saveHasMany;
}

function getDocsForRelations() {
  let result = [];

  let c = { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor' } };
  if (savingHasMany()) {
    c.data.ingredients = ['X', 'Y'];
  }
  result.push(c);

  let d = { _id: 'tacoSoup_2_D', data: { flavor: 'black bean' } };
  if (savingHasMany()) {
    d.data.ingredients = ['Z'];
  }
  result.push(d);

  result.push({ _id: 'foodItem_2_X', data: { name: 'pineapple', soup: 'C' } });
  result.push({ _id: 'foodItem_2_Y', data: { name: 'pork loin', soup: 'C' } });
  result.push({
    _id: 'foodItem_2_Z',
    data: { name: 'black beans', soup: 'D' },
  });

  return result;
}

/*
 * Tests basic CRUD behavior for an app using the ember-pouch adapter.
 */

module('Integration | Adapter | Basic CRUD Ops', {}, function (hooks) {
  setupTest(hooks);
  moduleForIntegration(hooks);

  let allTests = function () {
    test('can find all', function (assert) {
      assert.expect(3);

      var done = assert.async();
      Promise.resolve()
        .then(() => {
          return this.db().bulkDocs([
            { _id: 'tacoSoup_2_A', data: { flavor: 'al pastor' } },
            { _id: 'tacoSoup_2_B', data: { flavor: 'black bean' } },
            { _id: 'burritoShake_2_X', data: { consistency: 'smooth' } },
          ]);
        })
        .then(() => {
          return this.store().findAll('taco-soup');
        })
        .then((found) => {
          assert.equal(
            found.get('length'),
            2,
            'should have found the two taco soup items only'
          );
          assert.deepEqual(
            found.mapBy('id'),
            ['A', 'B'],
            'should have extracted the IDs correctly'
          );
          assert.deepEqual(
            found.mapBy('flavor'),
            ['al pastor', 'black bean'],
            'should have extracted the attributes also'
          );
        })
        .finally(done);
    });

    test('can find one', function (assert) {
      assert.expect(2);

      var done = assert.async();
      Promise.resolve()
        .then(() => {
          return this.db().bulkDocs([
            { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor' } },
            { _id: 'tacoSoup_2_D', data: { flavor: 'black bean' } },
          ]);
        })
        .then(() => {
          return this.store().find('taco-soup', 'D');
        })
        .then((found) => {
          assert.equal(
            found.get('id'),
            'D',
            'should have found the requested item'
          );
          assert.deepEqual(
            found.get('flavor'),
            'black bean',
            'should have extracted the attributes also'
          );
        })
        .finally(done);
    });

    test('can query with sort', function (assert) {
      assert.expect(3);
      var done = assert.async();
      Promise.resolve()
        .then(() => {
          return this.db()
            .createIndex({
              index: {
                fields: ['data.name'],
              },
            })
            .then(() => {
              return this.db().bulkDocs([
                {
                  _id: 'smasher_2_mario',
                  data: { name: 'Mario', series: 'Mario', debut: 1981 },
                },
                {
                  _id: 'smasher_2_puff',
                  data: { name: 'Jigglypuff', series: 'Pokemon', debut: 1996 },
                },
                {
                  _id: 'smasher_2_link',
                  data: { name: 'Link', series: 'Zelda', debut: 1986 },
                },
                {
                  _id: 'smasher_2_dk',
                  data: { name: 'Donkey Kong', series: 'Mario', debut: 1981 },
                },
                {
                  _id: 'smasher_2_pika',
                  data: {
                    name: 'Pikachu',
                    series: 'Pokemon',
                    _id: 'pikachu',
                    debut: 1996,
                  },
                },
              ]);
            });
        })
        .then(() => {
          return this.store().query('smasher', {
            filter: { name: { $gt: '' } },
            sort: ['name'],
          });
        })
        .then((found) => {
          assert.equal(
            found.get('length'),
            5,
            'should returns all the smashers '
          );
          assert.deepEqual(
            found.mapBy('id'),
            ['dk', 'puff', 'link', 'mario', 'pika'],
            'should have extracted the IDs correctly'
          );
          assert.deepEqual(
            found.mapBy('name'),
            ['Donkey Kong', 'Jigglypuff', 'Link', 'Mario', 'Pikachu'],
            'should have extracted the attributes also'
          );
        })
        .finally(done);
    });

    test('can query multi-field queries', function (assert) {
      assert.expect(3);
      var done = assert.async();
      Promise.resolve()
        .then(() => {
          return this.db()
            .createIndex({
              index: {
                fields: ['data.series', 'data.debut'],
              },
            })
            .then(() => {
              return this.db().bulkDocs([
                {
                  _id: 'smasher_2_mario',
                  data: { name: 'Mario', series: 'Mario', debut: 1981 },
                },
                {
                  _id: 'smasher_2_puff',
                  data: { name: 'Jigglypuff', series: 'Pokemon', debut: 1996 },
                },
                {
                  _id: 'smasher_2_link',
                  data: { name: 'Link', series: 'Zelda', debut: 1986 },
                },
                {
                  _id: 'smasher_2_dk',
                  data: { name: 'Donkey Kong', series: 'Mario', debut: 1981 },
                },
                {
                  _id: 'smasher_2_pika',
                  data: {
                    name: 'Pikachu',
                    series: 'Pokemon',
                    _id: 'pikachu',
                    debut: 1996,
                  },
                },
              ]);
            });
        })
        .then(() => {
          return this.store().query('smasher', {
            filter: { series: 'Mario' },
            sort: [{ series: 'desc' }, { debut: 'desc' }],
          });
        })
        .then((found) => {
          assert.equal(
            found.get('length'),
            2,
            'should have found the two smashers'
          );
          assert.deepEqual(
            found.mapBy('id'),
            ['mario', 'dk'],
            'should have extracted the IDs correctly'
          );
          assert.deepEqual(
            found.mapBy('name'),
            ['Mario', 'Donkey Kong'],
            'should have extracted the attributes also'
          );
        })
        .finally(done);
    });

    test('queryRecord returns null when no record is found', function (assert) {
      assert.expect(1);
      var done = assert.async();
      Promise.resolve()
        .then(() => {
          return this.db()
            .createIndex({
              index: {
                fields: ['data.flavor'],
              },
            })
            .then(() => {
              return this.db().bulkDocs([
                {
                  _id: 'tacoSoup_2_C',
                  data: { flavor: 'al pastor', ingredients: ['X', 'Y'] },
                },
                {
                  _id: 'tacoSoup_2_D',
                  data: { flavor: 'black bean', ingredients: ['Z'] },
                },
                { _id: 'foodItem_2_X', data: { name: 'pineapple' } },
                { _id: 'foodItem_2_Y', data: { name: 'pork loin' } },
                { _id: 'foodItem_2_Z', data: { name: 'black beans' } },
              ]);
            });
        })
        .then(() => {
          return this.store().queryRecord('taco-soup', {
            filter: { flavor: 'all pastor' },
          });
        })
        .then((found) => {
          assert.equal(found, null, 'should be null');
          done();
        })
        .catch((error) => {
          assert.ok(false, 'error in test:' + error);
          done();
        });
    });

    test('can query one record', function (assert) {
      assert.expect(1);

      var done = assert.async();
      Promise.resolve()
        .then(() => {
          return this.db()
            .createIndex({
              index: {
                fields: ['data.flavor'],
              },
            })
            .then(() => {
              return this.db().bulkDocs(getDocsForRelations());
            });
        })
        .then(() => {
          return this.store().queryRecord('taco-soup', {
            filter: { flavor: 'al pastor' },
          });
        })
        .then((found) => {
          assert.equal(
            found.get('flavor'),
            'al pastor',
            'should have found the requested item'
          );
        })
        .finally(done);
    });

    test('can query one associated records', function (assert) {
      assert.expect(3);
      var done = assert.async();
      Promise.resolve()
        .then(() => {
          return this.db()
            .createIndex({
              index: {
                fields: ['data.flavor'],
              },
            })
            .then(() => {
              return this.db().bulkDocs(getDocsForRelations());
            });
        })
        .then(() => {
          return this.store().queryRecord('taco-soup', {
            filter: { flavor: 'al pastor' },
          });
        })
        .then((found) => {
          assert.equal(
            found.get('flavor'),
            'al pastor',
            'should have found the requested item'
          );
          return found.get('ingredients');
        })
        .then((foundIngredients) => {
          assert.deepEqual(
            foundIngredients.mapBy('id'),
            ['X', 'Y'],
            'should have found both associated items'
          );
          assert.deepEqual(
            foundIngredients.mapBy('name'),
            ['pineapple', 'pork loin'],
            'should have fully loaded the associated items'
          );
        })
        .finally(done);
    });

    test('can find associated records', function (assert) {
      assert.expect(3);

      var done = assert.async();
      Promise.resolve()
        .then(() => {
          return this.db().bulkDocs(getDocsForRelations());
        })
        .then(() => {
          return this.store().find('taco-soup', 'C');
        })
        .then((found) => {
          assert.equal(
            found.get('id'),
            'C',
            'should have found the requested item'
          );
          return found.get('ingredients');
        })
        .then((foundIngredients) => {
          assert.deepEqual(
            foundIngredients.mapBy('id'),
            ['X', 'Y'],
            'should have found both associated items'
          );
          assert.deepEqual(
            foundIngredients.mapBy('name'),
            ['pineapple', 'pork loin'],
            'should have fully loaded the associated items'
          );
        })
        .finally(done);
    });

    test('create a new record', function (assert) {
      assert.expect(2);

      var done = assert.async();
      Promise.resolve()
        .then(() => {
          var newSoup = this.store().createRecord('taco-soup', {
            id: 'E',
            flavor: 'balsamic',
          });
          return newSoup.save();
        })
        .then(() => {
          return this.db().get('tacoSoup_2_E');
        })
        .then((newDoc) => {
          assert.equal(
            newDoc.data.flavor,
            'balsamic',
            'should have saved the attribute'
          );

          var recordInStore = this.store().peekRecord('tacoSoup', 'E');
          assert.equal(
            newDoc._rev,
            recordInStore.get('rev'),
            'should have associated the ember-data record with the rev for the new record'
          );
        })
        .finally(done);
    });

    test('creating an associated record stores a reference to it in the parent', function (assert) {
      assert.expect(1);

      var done = assert.async();
      Promise.resolve()
        .then(() => {
          var s = { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor' } };
          if (savingHasMany()) {
            s.data.ingredients = [];
          }
          return this.db().bulkDocs([s]);
        })
        .then(() => {
          return this.store().findRecord('taco-soup', 'C');
        })
        .then((tacoSoup) => {
          var newIngredient = this.store().createRecord('food-item', {
            name: 'pineapple',
            soup: tacoSoup,
          });

          //tacoSoup.save() actually not needed in !savingHasmany mode, but should still work
          return newIngredient
            .save()
            .then(() => (savingHasMany() ? tacoSoup.save() : tacoSoup));
        })
        .then(() => {
          run(() => this.store().unloadAll());
          return this.store().findRecord('taco-soup', 'C');
        })
        .then((tacoSoup) => {
          return tacoSoup.get('ingredients');
        })
        .then((foundIngredients) => {
          assert.deepEqual(
            foundIngredients.mapBy('name'),
            ['pineapple'],
            'should have fully loaded the associated items'
          );
        })
        .finally(done);
    });

    // This test fails due to a bug in ember data
    // (https://github.com/emberjs/data/issues/3736)
    // starting with ED v2.0.0-beta.1. It works again with ED v2.1.0.
    if (!DS.VERSION.match(/^2\.0/)) {
      test('update an existing record', function (assert) {
        assert.expect(2);

        var done = assert.async();
        Promise.resolve()
          .then(() => {
            return this.db().bulkDocs([
              { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor' } },
              { _id: 'tacoSoup_2_D', data: { flavor: 'black bean' } },
            ]);
          })
          .then(() => {
            return this.store().find('taco-soup', 'C');
          })
          .then((found) => {
            found.set('flavor', 'pork');
            return found.save();
          })
          .then(() => {
            return this.db().get('tacoSoup_2_C');
          })
          .then((updatedDoc) => {
            assert.equal(
              updatedDoc.data.flavor,
              'pork',
              'should have updated the attribute'
            );

            var recordInStore = this.store().peekRecord('tacoSoup', 'C');
            assert.equal(
              updatedDoc._rev,
              recordInStore.get('rev'),
              'should have associated the ember-data record with the updated rev'
            );
          })
          .finally(done);
      });
    }

    test('delete an existing record', function (assert) {
      assert.expect(1);

      var done = assert.async();
      Promise.resolve()
        .then(() => {
          return this.db().bulkDocs([
            { _id: 'tacoSoup_2_C', data: { flavor: 'al pastor' } },
            { _id: 'tacoSoup_2_D', data: { flavor: 'black bean' } },
          ]);
        })
        .then(() => {
          return this.store().find('taco-soup', 'C');
        })
        .then((found) => {
          return found.destroyRecord();
        })
        .then(() => {
          return this.db().get('tacoSoup_2_C');
        })
        .then(
          (doc) => {
            assert.notOk(doc, 'document should no longer exist');
          },
          (result) => {
            assert.equal(result.status, 404, 'document should no longer exist');
          }
        )
        .finally(done);
    });
  };

  let asyncTests = function () {
    test('eventually consistency - success', function (assert) {
      assert.expect(1);
      assert.timeout(5000);
      var done = assert.async();
      Promise.resolve()
        .then(() => {
          return this.db().bulkDocs([
            { _id: 'foodItem_2_X', data: { name: 'pineapple', soup: 'C' } },
            //{_id: 'tacoSoup_2_C', data: { flavor: 'test' } }
          ]);
        })
        .then(() => this.store().findRecord('food-item', 'X'))
        .then((foodItem) => {
          let result = [
            foodItem.get('soup').then((soup) => assert.equal(soup.id, 'C')),

            promiseToRunLater(0).then(() => {
              return this.db().bulkDocs([
                { _id: 'tacoSoup_2_C', data: { flavor: 'test' } },
              ]);
            }),
          ];

          return all(result);
        })
        .finally(done);
    });

    test('eventually consistency - deleted', function (assert) {
      assert.expect(1);
      assert.timeout(5000);
      var done = assert.async();
      Promise.resolve()
        .then(() => {
          return this.db().bulkDocs([
            { _id: 'foodItem_2_X', data: { name: 'pineapple', soup: 'C' } },
            //{_id: 'tacoSoup_2_C', data: { flavor: 'test' } }
          ]);
        })
        .then(() => this.store().findRecord('food-item', 'X'))
        .then((foodItem) => {
          let result = [
            foodItem
              .get('soup')
              .then((soup) => assert.strictEqual(soup, null, 'isDeleted'))
              .catch(() => assert.ok(true, 'isDeleted')),

            promiseToRunLater(100).then(() =>
              this.db().bulkDocs([{ _id: 'tacoSoup_2_C', _deleted: true }])
            ),
          ];

          return all(result);
        })
        .finally(done);
    });

    test('_init should work', function (assert) {
      let db = this.db();

      assert.equal(db.rel, undefined, 'should start without schema');

      let promises = [];

      let adapter = this.adapter();
      promises.push(
        adapter._init(this.store(), this.store().modelFor('taco-soup'))
      );

      //this tests _init synchronously by design, as re-entry and infitinite loop detection works this way
      assert.notEqual(db.rel, undefined, '_init should set schema');
      assert.equal(
        this.adapter()._schema.length,
        2,
        'should have set all relationships on the schema'
      );

      promises.push(
        adapter._init(this.store(), this.store().modelFor('taco-soup'))
      );

      return all(promises);
    });

    //TODO: only do this for async or dontsavehasmany?
    test('delete cascade null', function (assert) {
      assert.timeout(5000);
      assert.expect(2);

      var done = assert.async();
      Promise.resolve()
        .then(() => {
          return this.db().bulkDocs(getDocsForRelations());
        })
        //  .then(() => this.store().findRecord('food-item', 'Z'))//prime ember-data store with Z
        //  .then(found => found.get('soup'))//prime belongsTo
        .then(() => this.store().findRecord('taco-soup', 'D'))
        .then((found) => {
          return found.destroyRecord();
        })
        .then(() => {
          run(() => this.store().unloadAll()); // normally this would be done by onChange listener
          return this.store().findRecord('food-item', 'Z'); //Z should be updated now
        })
        .then((found) => {
          return Promise.resolve(found.get('soup'))
            .catch(() => null)
            .then((soup) => {
              assert.ok(
                !found.belongsTo || found.belongsTo('soup').value() === null,
                'should set value of belongsTo to null'
              );
              return soup;
            });
        })
        .then((soup) => {
          assert.ok(
            soup === null,
            'deleted soup should have cascaded to a null value for the belongsTo'
          );
        })
        .finally(done);
    });

    test('remote delete removes belongsTo relationship', function (assert) {
      assert.timeout(5000);
      assert.expect(2);

      var done = assert.async();
      Promise.resolve()
        .then(() => {
          return this.db().bulkDocs(getDocsForRelations());
        })
        .then(() => this.store().findRecord('food-item', 'Z')) //prime ember-data store with Z
        .then((found) => found.get('soup')) //prime belongsTo
        .then((found) => {
          let id = 'tacoSoup_2_' + found.id;
          let promise = this.adapter().waitForChangeWithID(id);

          this.db().remove(id, found.get('rev'));

          return promise;
        })
        .then(() => {
          return this.store().findRecord('food-item', 'Z'); //Z should be updated now
        })
        .then((found) => {
          return Promise.resolve(found.get('soup'))
            .catch(() => null)
            .then((soup) => {
              assert.ok(
                !found.belongsTo || found.belongsTo('soup').value() === null,
                'should set value of belongsTo to null'
              );
              return soup;
            });
        })
        .then((soup) => {
          assert.ok(
            soup === null,
            'deleted soup should have cascaded to a null value for the belongsTo'
          );
        })
        .finally(done);
    });

    test('remote delete removes hasMany relationship', function (assert) {
      assert.timeout(5000);
      assert.expect(3);

      let liveIngredients = null;

      var done = assert.async();
      Promise.resolve()
        .then(() => {
          return this.db().bulkDocs(getDocsForRelations());
        })
        .then(() => this.store().findRecord('taco-soup', 'C')) //prime ember-data store with C
        .then((found) => found.get('ingredients')) //prime hasMany
        .then((ingredients) => {
          liveIngredients = ingredients; //save for later

          assert.equal(
            ingredients.length,
            2,
            'should be 2 food items initially'
          );

          let itemToDelete = ingredients.toArray()[0];
          let id = 'foodItem_2_' + itemToDelete.id;
          let promise = this.adapter().waitForChangeWithID(id);

          this.db().remove(id, itemToDelete.get('rev'));

          return promise;
        })
        .then(() => {
          return this.store().findRecord('taco-soup', 'C'); //get updated soup.ingredients
        })
        .then((found) => found.get('ingredients'))
        .then((ingredients) => {
          assert.equal(
            ingredients.length,
            1,
            '1 food item should be removed from the relationship'
          );
          assert.equal(
            liveIngredients.length,
            1,
            '1 food item should be removed from the live relationship'
          );
        })
        .finally(done);
    });

    module(
      'not eventually consistent',
      {
        beforeEach: function () {
          config.emberPouch.eventuallyConsistent = false;
        },
        afterEach: function () {
          config.emberPouch.eventuallyConsistent = true;
        },
      },
      function () {
        test('not found', function (assert) {
          assert.expect(2);
          assert.false(
            config.emberPouch.eventuallyConsistent,
            'eventuallyConsistent is false'
          );
          let done = assert.async();

          Promise.resolve().then(() =>
            this.store()
              .findRecord('food-item', 'non-existent')
              .then(() => assert.ok(false))
              .catch(() => {
                assert.ok(true, 'item is not found');
                done();
              })
          );
        });
      }
    );
  };

  let syncAsync = function () {
    module(
      'async',
      {
        beforeEach: function () {
          config.emberPouch.async = true;
        },
      },
      () => {
        allTests();
        asyncTests();
      }
    );
    module(
      'sync',
      {
        beforeEach: function () {
          config.emberPouch.async = false;
        },
      },
      allTests
    );
  };

  module(
    'dont save hasMany',
    {
      beforeEach: function () {
        config.emberPouch.saveHasMany = false;
      },
    },
    syncAsync
  );

  module(
    'save hasMany',
    {
      beforeEach: function () {
        config.emberPouch.saveHasMany = true;
      },
    },
    syncAsync
  );
});
