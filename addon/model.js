import Model, { attr } from '@ember-data/model';

export default Model.extend({
  rev: attr('string'),
});
