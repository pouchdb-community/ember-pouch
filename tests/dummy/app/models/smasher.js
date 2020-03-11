import DS from 'ember-data';
import { Model } from 'ember-pouch';

export default Model.extend({
  name: DS.attr('string'),
  series: DS.attr('string'),
  debut: DS.attr(),
});

