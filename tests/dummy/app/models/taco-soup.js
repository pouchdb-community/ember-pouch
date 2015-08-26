import DS from 'ember-data';

export default DS.Model.extend({
  rev: DS.attr('string'),

  flavor: DS.attr('string'),
  breadFlour: DS.attr('string', undefined),
  ingredients: DS.hasMany('food-item', { async: true })
});
