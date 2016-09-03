import DS from 'ember-data';

export default DS.Model.extend({
  rev: DS.attr('string'),

  coverImage: DS.attr('attachment'),
  photos: DS.attr('attachments')
});
