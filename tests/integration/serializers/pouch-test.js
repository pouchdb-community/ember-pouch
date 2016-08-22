import { test } from 'qunit';
import moduleForIntegration from '../../helpers/module-for-acceptance';

import Ember from 'ember';

/*
 * Tests attachments behavior for an app using the ember-pouch serializer.
 */

moduleForIntegration('Integration | Serializer | Attachments');

let id = 'E';
let coverImage = {
  name: 'cover.jpg',
  content_type: 'image/jpeg',
  data: window.btoa('cover.jpg'),
  length: 9
};
let photo1 = {
  name: 'photo-1.jpg',
  content_type: 'image/jpeg',
  data: window.btoa('photo-1.jpg')
};
let photo2 = {
  name: 'photo-2.jpg',
  content_type: 'image/jpeg',
  data: window.btoa('photo-2.jpg')
};

test('puts attachments into the `attachments` property when saving', function (assert) {
  assert.expect(10);

  var done = assert.async();
  Ember.RSVP.Promise.resolve().then(() => {
    var newRecipe = this.store().createRecord('taco-recipe', {
      id,
      coverImage: coverImage,
      photos: [photo1, photo2]
    });
    return newRecipe.save();
  }).then(() => {
    return this.db().get('tacoRecipe_2_E');
  }).then((newDoc) => {
    assert.deepEqual(newDoc._attachments, {
      'cover.jpg': {
        digest: 'md5-SxxZx3KOKxy2X2yyCq9c+Q==',
        content_type: 'image/jpeg',
        revpos: undefined,
        stub: true,
        length: 9
      },
      'photo-1.jpg': {
        digest: 'md5-MafOMdm9kXWId0ruvo8sTA==',
        content_type: 'image/jpeg',
        revpos: undefined,
        stub: true,
        length: 11
      },
      'photo-2.jpg': {
        digest: 'md5-VNkFh9jG/28rwoFW9L910g==',
        content_type: 'image/jpeg',
        revpos: undefined,
        stub: true,
        length: 11
      }
    }, 'attachments are placed into the _attachments property of the doc');
    assert.equal('cover_image' in newDoc.data, true,
      'respects the mapping provided by the serializer `attrs`'
    );
    assert.deepEqual(newDoc.data.cover_image, {
      'cover.jpg': {
        length: 9
      }
    }, 'the attribute contains the file name');
    assert.equal(newDoc.data.cover_image['cover.jpg'].length, 9,
      'the attribute contains the length to avoid empty length when File objects are ' +
      'saved and have not been reloaded'
    );
    assert.deepEqual(newDoc.data.photo_gallery, {
      'photo-1.jpg': {},
      'photo-2.jpg': {}
    });

    var recordInStore = this.store().peekRecord('tacoRecipe', 'E');
    let coverImage = recordInStore.get('coverImage');
    assert.equal(coverImage.get('name'), coverImage.name);
    assert.equal(coverImage.get('data'), coverImage.data);

    let photos = recordInStore.get('photos');
    assert.equal(photos.length, 2, '2 photos');
    assert.equal(photos[0].get('name'), photo1.name);
    assert.equal(photos[0].get('data'), photo1.data);

    done();
  }).catch((error) => {
    console.error('error in test', error);
    assert.ok(false, 'error in test:' + error);
    done();
  });
});
