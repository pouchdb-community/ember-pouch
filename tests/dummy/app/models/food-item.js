import DS from 'ember-data';
import Model from '../model';

// N.b.: awkward model name is to test getRecordTypeName

export default Model.extend({
  name: DS.attr('string'),
  soup: DS.belongsTo('taco-soup')
});
