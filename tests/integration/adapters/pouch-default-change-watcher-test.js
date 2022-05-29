import { later } from '@ember/runloop';
import { Promise, resolve } from 'rsvp';
import { module, test } from 'qunit';
import moduleForIntegration from '../../helpers/module-for-pouch-acceptance';
import { setupTest } from 'ember-qunit';

/*
 * Tests for the default automatic change listener.
 */

function promiseToRunLater(callback, timeout) {
  return new Promise((resolve) => {
    later(() => {
      callback();
      resolve();
    }, timeout);
  });
}

module('Integration | Adapter | Default Change Watcher', function (hooks) {
  setupTest(hooks);
  moduleForIntegration(hooks);

  hooks.beforeEach(function (assert) {
    var done = assert.async();

    Promise.resolve()
      .then(() => {
        return this.db().bulkDocs([
          {
            _id: 'tacoSoup_2_A',
            data: { flavor: 'al pastor', ingredients: ['X', 'Y'] },
          },
          {
            _id: 'tacoSoup_2_B',
            data: { flavor: 'black bean', ingredients: ['Z'] },
          },
          { _id: 'foodItem_2_X', data: { name: 'pineapple', soup: 'A' } },
          { _id: 'foodItem_2_Y', data: { name: 'pork loin', soup: 'A' } },
          { _id: 'foodItem_2_Z', data: { name: 'black beans', soup: 'B' } },
        ]);
      })
      .finally(done);
  });

  test('a loaded instance automatically reflects directly-made database changes', function (assert) {
    assert.expect(2);
    var done = assert.async();

    resolve()
      .then(() => {
        return this.store().find('taco-soup', 'B');
      })
      .then((soupB) => {
        assert.strictEqual(
          soupB.get('flavor'),
          'black bean',
          'the loaded instance should reflect the initial test data'
        );

        return this.db().get('tacoSoup_2_B');
      })
      .then((soupBRecord) => {
        soupBRecord.data.flavor = 'carnitas';
        return this.db().put(soupBRecord);
      })
      .then(() => {
        return promiseToRunLater(() => {
          var alreadyLoadedSoupB = this.store().peekRecord('taco-soup', 'B');
          assert.strictEqual(
            alreadyLoadedSoupB.get('flavor'),
            'carnitas',
            'the loaded instance should automatically reflect the change in the database'
          );
        }, 100);
      })
      .finally(done);
  });

  test('a record that is not loaded stays not loaded when it is changed', function (assert) {
    assert.expect(2);
    var done = assert.async();

    resolve()
      .then(() => {
        assert.strictEqual(
          this.store().peekRecord('taco-soup', 'A'),
          null,
          'test setup: record should not be loaded already'
        );

        return this.db().get('tacoSoup_2_A');
      })
      .then((soupARecord) => {
        soupARecord.data.flavor = 'barbacoa';
        return this.db().put(soupARecord);
      })
      .then(() => {
        return promiseToRunLater(() => {
          assert.strictEqual(
            this.store().peekRecord('taco-soup', 'A'),
            null,
            'the corresponding instance should still not be loaded'
          );
        }, 15);
      })
      .finally(done);
  });

  test('a new record is not automatically loaded', function (assert) {
    assert.expect(2);
    var done = assert.async();

    resolve()
      .then(() => {
        assert.strictEqual(
          this.store().peekRecord('taco-soup', 'C'),
          null,
          'test setup: record should not be loaded already'
        );

        return this.db().put({
          _id: 'tacoSoup_2_C',
          data: { flavor: 'sofritas' },
        });
      })
      .then(() => {
        return promiseToRunLater(() => {
          assert.strictEqual(
            this.store().peekRecord('taco-soup', 'C'),
            null,
            'the corresponding instance should still not be loaded'
          );
        }, 15);
      })
      .finally(done);
  });

  test('a deleted record is automatically marked deleted', function (assert) {
    assert.expect(2);
    var done = assert.async();

    let initialRecord = null;

    resolve()
      .then(() => {
        return this.store().find('taco-soup', 'B');
      })
      .then((soupB) => {
        initialRecord = soupB;
        assert.strictEqual(
          soupB.get('flavor'),
          'black bean',
          'the loaded instance should reflect the initial test data'
        );
        return this.db().get('tacoSoup_2_B');
      })
      .then((soupBRecord) => {
        return this.db().remove(soupBRecord);
      })
      .then(() => {
        return promiseToRunLater(() => {
          assert.ok(
            initialRecord.get('isDeleted'),
            'the corresponding instance should now be deleted '
          );
        }, 100);
      })
      .finally(done);
  });

  test('a change to a record with a non-relational-pouch ID does not cause an error', function (assert) {
    assert.expect(0);
    var done = assert.async();

    resolve()
      .then(() => {
        // do some op to cause relational-pouch to be initialized
        return this.store().find('taco-soup', 'B');
      })
      .then(() => {
        return this.db().put({
          _id: '_design/ingredient-use',
        });
      })
      .finally(done);
  });

  test('a change to a record of an unknown type does not cause an error', function (assert) {
    assert.expect(0);
    var done = assert.async();

    resolve()
      .then(() => {
        // do some op to cause relational-pouch to be initialized
        return this.store().find('taco-soup', 'B');
      })
      .then(() => {
        return this.db().put({
          _id: 'burritoShake_2_X',
          data: { consistency: 'chunky' },
        });
      })
      .finally(done);
  });
});

module(
  'Integration | Adapter | With unloadedDocumentChanged implementation to load new docs into store',
  function (hooks) {
    setupTest(hooks);
    moduleForIntegration(hooks);

    hooks.beforeEach(function (assert) {
      var done = assert.async();
      this.adapter = function adapter() {
        return this.store().adapterFor('taco-salad');
      };
      this.db = function db() {
        return this.adapter().get('db');
      };

      Promise.resolve()
        .then(() => {
          return this.db().bulkDocs([
            {
              _id: 'tacoSalad_2_A',
              data: { flavor: 'al pastor', ingredients: ['X', 'Y'] },
            },
            {
              _id: 'tacoSalad_2_B',
              data: { flavor: 'black bean', ingredients: ['Z'] },
            },
            { _id: 'foodItem_2_X', data: { name: 'pineapple' } },
            { _id: 'foodItem_2_Y', data: { name: 'pork loin' } },
            { _id: 'foodItem_2_Z', data: { name: 'black beans' } },
          ]);
        })
        .finally(done);
    });

    test('a new record is automatically loaded', function (assert) {
      assert.expect(4);
      var done = assert.async();

      resolve()
        .then(() => {
          return this.store().find('taco-salad', 'B');
        })
        .then((soupB) => {
          assert.strictEqual(
            soupB.get('flavor'),
            'black bean',
            'the loaded instance should reflect the initial test data'
          );
        })
        .then(() => {
          assert.strictEqual(
            this.store().peekRecord('taco-salad', 'C'),
            null,
            'test setup: record should not be loaded already'
          );

          return this.db().put({
            _id: 'tacoSalad_2_C',
            data: { flavor: 'sofritas' },
          });
        })
        .then(() => {
          return promiseToRunLater(() => {
            var alreadyLoadedSaladC = this.store().peekRecord(
              'taco-salad',
              'C'
            );
            assert.ok(
              alreadyLoadedSaladC,
              'the corresponding instance should now be loaded'
            );
            //if (alreadyLoadedSaladC) {
            assert.strictEqual(
              alreadyLoadedSaladC.get('flavor'),
              'sofritas',
              'the corresponding instance should now be loaded with the right data'
            );
            //}
          }, 15);
        })
        .finally(done);
    });
  }
);
