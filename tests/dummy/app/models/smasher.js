import DS from 'ember-data';

export default DS.Model.extend({
  rev: DS.attr('string'),

  name: DS.attr('string'),
  series: DS.attr('string'),
  debut: DS.attr(),
});

