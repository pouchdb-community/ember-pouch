import PouchAdapter from 'ember-pouch/adapters/pouch';
import config from '../config/environment';

export default PouchAdapter.extend({
  url: config.pouch && config.pouch.local
});
