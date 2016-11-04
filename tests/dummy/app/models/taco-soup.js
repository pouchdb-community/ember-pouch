import DS from 'ember-data';
import Model from '../model';

export default Model.extend({
  flavor: DS.attr('string'),
  ingredients: DS.hasMany('food-item')
});
