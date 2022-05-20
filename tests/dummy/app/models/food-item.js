import { attr, belongsTo } from '@ember-data/model';
import { Model } from 'ember-pouch';

// N.b.: awkward model name is to test getRecordTypeName

export default Model.extend({
  name: attr('string'),
  soup: belongsTo('taco-soup'),
});
