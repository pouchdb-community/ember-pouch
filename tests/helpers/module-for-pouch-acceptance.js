import { Promise, all, resolve } from 'rsvp';

export default function (hooks) {
  hooks.beforeEach(function () {
    return Promise.resolve().then(() => {
      this.store = function store() {
        return this.owner.lookup('service:store');
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
  });

  hooks.afterEach(function () {
    let db = this.db();
    return all(this.adapter()._indexPromises)
      .then(() => {
        return db.getIndexes().then((data) => {
          return all(
            data.indexes.map((index) => {
              return index.ddoc ? db.deleteIndex(index) : resolve();
            })
          );
        });
      })
      .then(() => db.destroy());
  });
}
