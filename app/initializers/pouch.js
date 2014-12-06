import PouchAdapter from 'ember-pouch/adapters/pouch';
import PouchSerializer from 'ember-pouch/serializers/pouch';
import config from '../config/environment';

export function initialize(container, application) {
  application.register('adapter:-pouch', PouchAdapter);
  application.register('serializer:-pouch', PouchSerializer);

  var adapter = container.lookup('adapter:application');

  if ((adapter instanceof PouchAdapter) && config.pouch) {
    if (config.pouch.remote) {
      var store = container.lookup('store:main');

      adapter.sync(store, config.pouch.remote);
    }
  }
}

export default {
  name: 'pouch',
  after: 'store',
  initialize: initialize
};
