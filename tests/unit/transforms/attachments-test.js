import EmberObject from '@ember/object';

import { module, test } from 'qunit';

import { setupTest } from 'ember-qunit';

let testSerializedData = {
  'hello.txt': {
    content_type: 'text/plain',
    data: 'aGVsbG8gd29ybGQ=',
    digest: "md5-7mkg+nM0HN26sZkLN8KVSA=="
    // CouchDB doesn't add 'length'
  },
  'stub.txt': {
    stub: true,
    content_type: 'text/plain',
    digest: "md5-7mkg+nM0HN26sZkLN8KVSA==",
    length: 11
  },
};

let testDeserializedData = [
  EmberObject.create({
    name: 'hello.txt',
    content_type: 'text/plain',
    data: 'aGVsbG8gd29ybGQ=',
    digest: 'md5-7mkg+nM0HN26sZkLN8KVSA=='
  }),
  EmberObject.create({
    name: 'stub.txt',
    content_type: 'text/plain',
    stub: true,
    digest: 'md5-7mkg+nM0HN26sZkLN8KVSA==',
    length: 11
  })
];

module('Unit | Transform | attachments', function(hooks) {
  setupTest(hooks);

  test('it serializes an attachment', function(assert) {
    let transform = this.owner.lookup('transform:attachments');
    assert.equal(transform.serialize(null), null);
    assert.equal(transform.serialize(undefined), null);
    assert.deepEqual(transform.serialize([]), {});

    let serializedData = transform.serialize(testDeserializedData);

    let hello = testDeserializedData[0].get('name');
    assert.equal(hello, 'hello.txt');
    assert.equal(serializedData[hello].content_type, testSerializedData[hello].content_type);
    assert.equal(serializedData[hello].data, testSerializedData[hello].data);

    let stub = testDeserializedData[1].get('name');
    assert.equal(stub, 'stub.txt');
    assert.equal(serializedData[stub].content_type, testSerializedData[stub].content_type);
    assert.equal(serializedData[stub].stub, true);
  });

  test('it deserializes an attachment', function(assert) {
    let transform = this.owner.lookup('transform:attachments');
    assert.deepEqual(transform.deserialize(null), []);
    assert.deepEqual(transform.deserialize(undefined), []);

    let deserializedData = transform.deserialize(testSerializedData);

    assert.equal(deserializedData[0].get('name'), testDeserializedData[0].get('name'));
    assert.equal(deserializedData[0].get('content_type'), testDeserializedData[0].get('content_type'));
    assert.equal(deserializedData[0].get('data'), testDeserializedData[0].get('data'));
    assert.equal(deserializedData[0].get('digest'), testDeserializedData[0].get('digest'));

    assert.equal(deserializedData[1].get('name'), testDeserializedData[1].get('name'));
    assert.equal(deserializedData[1].get('content_type'), testDeserializedData[1].get('content_type'));
    assert.equal(deserializedData[1].get('stub'), true);
    assert.equal(deserializedData[1].get('digest'), testDeserializedData[1].get('digest'));
    assert.equal(deserializedData[1].get('length'), testDeserializedData[1].get('length'));
  });
});
