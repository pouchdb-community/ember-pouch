import { attr } from '@ember-data/model';
import { Model } from 'ember-pouch';

export default Model.extend({
  coverImage: attr('attachment'),
  photos: attr('attachments'),
});
