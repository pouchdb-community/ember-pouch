import { attr, hasMany } from '@ember-data/model';
import { Model } from 'ember-pouch';

export default Model.extend({
  flavor: attr('string'),
  ingredients: hasMany('food-item'),
});
