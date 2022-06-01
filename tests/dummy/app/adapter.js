import { Adapter } from 'ember-pouch';
import config from 'dummy/config/environment';

export default class DummyAdapter extends Adapter{
  _init(store, type) {
    type.eachRelationship((name, rel) => {
      rel.options.async = config.emberPouch.async;
      if (rel.kind === 'hasMany') {
        rel.options.save = config.emberPouch.saveHasMany;
      }
    });
    if (super.onChange) {
      return super._init(...arguments);
    } 
  }
}
