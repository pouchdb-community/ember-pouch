# Ember Pouch

Ember Pouch is a PouchDB/CouchDB adapter for Ember Data.

Instead of using the standard RESTAdapter or FixtureAdapter, you can sync your Ember model objects to PouchDB, and then on to CouchDB or other CouchDB-compliant servers (Cloudant, Couchbase, IrisCouch, etc.). This adds real-time sync to your Ember app, as well as making it [offline-first](http://offlinefirst.org/).

This module is really just a thin layer of Ember-y goodness over [Relational Pouch](https://github.com/nolanlawson/relational-pouch). Before you file an issue, please check to see if it's more appropriate to file over there.

## Installation

Download the `dist/` files you want, or install with Bower:

    $ bower install ember-pouch --save

Or from npm:

    $ npm install ember-pouch --save

**Note:** if you *don't* install with Bower, then you will also have to manually download
[PouchDB](https://github.com/pouchdb/pouchdb) and [relational-pouch](https://github.com/nolanlawson/relational-pouch).
Bower installs the dependencies automatically; the others don't.

Now that you have the `dist/` files locally, you just put this in your `Brocfile.js`:

```js
app.import('bower_components/pouchdb/dist/pouchdb.js');
app.import('bower_components/relational-pouch/dist/pouchdb.relational-pouch.js');
app.import('bower_components/ember-pouch/dist/globals/main.js');
```

Now you're ready to cook with Ember Pouch!


## Usage

#### Set up your models

Next, you need to add a `rev` field to all of your Models. This is used by PouchDB/CouchDB
to manage revisions:

```js
var Todo = DS.Model.extend({
  title       : DS.attr('string'),
  isCompleted : DS.attr('boolean'),
  rev         : DS.attr('string')    // <-- Add this to all your models
});
```

If you forget to do this, you will see the error:

    Failed to load resource: the server responded with a status of 409 (Conflict)

in your console.

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
```

As a direct client to CouchDB:

```js
 var db = new PouchDB('http://localhost:5984/mydb');
```

As a local database that syncs with CouchDB:

```js
var db = new PouchDB('mydb');
db.sync('http://localhost:5984/mydb', {live: true});
```

For more info, see the official PouchDB documentation at [PouchDB.com](http://pouchdb.com).

## Build

    $ npm run build
