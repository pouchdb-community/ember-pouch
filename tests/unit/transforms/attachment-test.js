import { moduleFor, test } from 'ember-qunit';

import Ember from 'ember';

let testSerializedData = {
  'test.txt': {
    content_type: 'text/plain',
    data: 'hello world!'
  },
  'stub.json': {
    stub: true,
    content_type: 'application/json'
  }
};

let testDeserializedData = [
  Ember.Object.create({
    name: 'test.txt',
    content_type: 'text/plain',
    data: 'hello world!'
  }),
  Ember.Object.create({
    name: 'stub.json',
    content_type: 'application/json',
    stub: true
  })
];

moduleFor('transform:attachment', 'Unit | Transform | attachment', {});

test('it serializes an attachment', function(assert) {
  let transform = this.subject();
  assert.equal(transform.serialize(null), null);
  assert.equal(transform.serialize(undefined), null);

  let serializedData = transform.serialize(testDeserializedData);
  let name = testDeserializedData[0].get('name');

  assert.equal(serializedData[name].content_type, testSerializedData[name].content_type);
  assert.equal(serializedData[name].data, testSerializedData[name].data);

  let stub = testDeserializedData[1].get('name');

  assert.equal(serializedData[stub].content_type, testSerializedData[stub].content_type);
  assert.equal(serializedData[stub].stub, true);
});

test('it deserializes an attachment', function(assert) {
  let transform = this.subject();
  assert.equal(transform.deserialize(null), null);
  assert.equal(transform.deserialize(undefined), null);

  let deserializedData = transform.deserialize(testSerializedData);

  assert.equal(deserializedData[0].get('name'), testDeserializedData[0].get('name'));
  assert.equal(deserializedData[0].get('content_type'), testDeserializedData[0].get('content_type'));
  assert.equal(deserializedData[0].get('data'), testDeserializedData[0].get('data'));

  assert.equal(deserializedData[1].get('name'), testDeserializedData[1].get('name'));
  assert.equal(deserializedData[1].get('content_type'), testDeserializedData[1].get('content_type'));
  assert.equal(deserializedData[1].get('stub'), true);
});
