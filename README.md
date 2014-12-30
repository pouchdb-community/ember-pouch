# Ember Pouch

Ember Pouch is a PouchDB/CouchDB adapter for Ember Data.

Instead of using the standard RESTAdapter or FixtureAdapter, you can sync your Ember model objects to PouchDB, and then on to CouchDB or other CouchDB-compliant servers (Cloudant, Couchbase, IrisCouch, etc.). This adds real-time sync to your Ember app, as well as making it [offline-first](http://offlinefirst.org/).

This module is really just a thin layer of Ember-y goodness over [Relational Pouch](https://github.com/nolanlawson/relational-pouch). Before you file an issue, please check to see if it's more appropriate to file over there.

## Installation

    $ npm install ember-pouch --save

Now you're ready to cook with Ember Pouch!


## Usage

#### Set up your adapter

Then, in your `application.js`, extend `EmberPouch.Adapter` and set your `PouchDB` database:

```js
export default EmberPouch.Adapter.extend({
  db: new PouchDB('mydb')
});
```

#### Using PouchDB

If you're not familiar with PouchDB, here are some of the different ways you can use it:

As a local PouchDB database:

```js
var db = new PouchDB('mydb');

export default EmberPouch.Adapter.extend({
  db: db
});
```

As a direct client to CouchDB:

```js
var db = new PouchDB('http://localhost:5984/mydb');
 
export default EmberPouch.Adapter.extend({
  db: db
});
```

As a local database that syncs with CouchDB:

```js
var db = new PouchDB('mydb');
var remote = new PouchDB('http://localhost:5984/mydb');

function doSync() {
  db.sync(remote, {live: true}).on('error', function (err) {
    setTimeout(doSync, 1000); // retry
  });
}
doSync();

export default EmberPouch.Adapter.extend({
  db: db
});
```

For more info on PouchDB, see the official PouchDB documentation at [PouchDB.com](http://pouchdb.com).

## Build

    $ npm run build

## Credits

This project was originally based on the [ember-data-hal-adapter](https://github.com/locks/ember-data-hal-adapter) by [@locks](https://github.com/locks), and I really benefited from his guidance during its creation.

And of course thanks to all our wonderful contributors, [here](https://github.com/nolanlawson/ember-pouch/graphs/contributors) and [in relational-pouch](https://github.com/nolanlawson/relational-pouch/graphs/contributors)! 
