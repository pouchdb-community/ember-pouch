import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    coverImage: 'cover_image',
    photos: { key: 'photo_gallery' },
  },
});
