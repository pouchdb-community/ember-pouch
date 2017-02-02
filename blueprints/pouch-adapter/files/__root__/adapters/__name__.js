import { Adapter } from 'ember-pouch';

export default Adapter.extend({
  pouch:Ember.inject.service(),
  init() {
    this._super(...arguments);
    this.set('db', this.get('pouch.db'));
  }
});
