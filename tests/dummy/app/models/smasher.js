import { attr } from '@ember-data/model';
import { Model } from 'ember-pouch';

export default Model.extend({
  name: attr('string'),
  series: attr('string'),
  debut: attr(),
});
