import DS from 'ember-data';

export default DS.Model.extend({
  rev: DS.attr('string'),

  name: DS.attr('string'),
  gyro: DS.belongsTo('gyro', { async: true, autoSave: true })
});
