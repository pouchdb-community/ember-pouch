import DS from 'ember-data';
import Model from '../model';

export default Model.extend({
  coverImage: DS.attr('attachment'),
  photos: DS.attr('attachments')
});
