import DS from 'ember-data';
import { Model } from 'ember-pouch';

// N.b.: awkward model name is to test getRecordTypeName

export default Model.extend({
  name: DS.attr('string'),
  soup: DS.belongsTo('taco-soup'),
});
