import EmberObject from '@ember/object';

import { module, test } from 'qunit';

import { setupTest } from 'ember-qunit';

let testSerializedData = {
  'hello.txt': {
    content_type: 'text/plain',
    data: 'aGVsbG8gd29ybGQ=',
    digest: 'md5-7mkg+nM0HN26sZkLN8KVSA==',
    // CouchDB doesn't add 'length'
  },
  'stub.txt': {
    stub: true,
    content_type: 'text/plain',
    digest: 'md5-7mkg+nM0HN26sZkLN8KVSA==',
    length: 11,
  },
};

let testDeserializedData = [
  EmberObject.create({
    name: 'hello.txt',
    content_type: 'text/plain',
    data: 'aGVsbG8gd29ybGQ=',
    digest: 'md5-7mkg+nM0HN26sZkLN8KVSA==',
  }),
  EmberObject.create({
    name: 'stub.txt',
    content_type: 'text/plain',
    stub: true,
    digest: 'md5-7mkg+nM0HN26sZkLN8KVSA==',
    length: 11,
  }),
];

module('Unit | Transform | attachments', function (hooks) {
  setupTest(hooks);

  test('it serializes an attachment', function (assert) {
    let transform = this.owner.lookup('transform:attachments');
    assert.strictEqual(transform.serialize(null), null);
    assert.strictEqual(transform.serialize(undefined), null);
    assert.deepEqual(transform.serialize([]), {});

    let serializedData = transform.serialize(testDeserializedData);

    let hello = testDeserializedData[0].get('name');
    assert.strictEqual(hello, 'hello.txt');
    assert.strictEqual(
      serializedData[hello].content_type,
      testSerializedData[hello].content_type
    );
    assert.strictEqual(
      serializedData[hello].data,
      testSerializedData[hello].data
    );

    let stub = testDeserializedData[1].get('name');
    assert.strictEqual(stub, 'stub.txt');
    assert.strictEqual(
      serializedData[stub].content_type,
      testSerializedData[stub].content_type
    );
    assert.true(serializedData[stub].stub);
  });

  test('it deserializes an attachment', function (assert) {
    let transform = this.owner.lookup('transform:attachments');
    assert.deepEqual(transform.deserialize(null), []);
    assert.deepEqual(transform.deserialize(undefined), []);

    let deserializedData = transform.deserialize(testSerializedData);

    assert.strictEqual(
      deserializedData[0].get('name'),
      testDeserializedData[0].get('name')
    );
    assert.strictEqual(
      deserializedData[0].get('content_type'),
      testDeserializedData[0].get('content_type')
    );
    assert.strictEqual(
      deserializedData[0].get('data'),
      testDeserializedData[0].get('data')
    );
    assert.strictEqual(
      deserializedData[0].get('digest'),
      testDeserializedData[0].get('digest')
    );

    assert.strictEqual(
      deserializedData[1].get('name'),
      testDeserializedData[1].get('name')
    );
    assert.strictEqual(
      deserializedData[1].get('content_type'),
      testDeserializedData[1].get('content_type')
    );
    assert.true(deserializedData[1].get('stub'));
    assert.strictEqual(
      deserializedData[1].get('digest'),
      testDeserializedData[1].get('digest')
    );
    assert.strictEqual(
      deserializedData[1].get('length'),
      testDeserializedData[1].get('length')
    );
  });
});
