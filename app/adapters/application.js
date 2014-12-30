import Ember from 'ember';
import PouchAdapter from 'ember-pouch/adapters/pouch';
import config from '../config/environment';

export default PouchAdapter.extend({
  url: Ember.get(config, 'pouch.local')
});
