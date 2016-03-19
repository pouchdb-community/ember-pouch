import DS from 'ember-data';

// N.b.: awkward model name is to test getRecordTypeName

export default DS.Model.extend({
  rev: DS.attr('string'),

  name: DS.attr('string'),
  soup: DS.belongsTo('taco-soup', { async: true })
});
