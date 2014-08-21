# Ember Pouch

Ember Data adapter for PouchDB/CouchDB. Really just a thin layer over [Relational Pouch](https://github.com/nolanlawson/relational-pouch).

## Installation

Download the `dist/` files you want, or install with Bower:

    $ bower install ember-pouch --save

Or from npm:

    $ npm install ember-pouch --save

**Note:** if you *don't* install with Bower, then you will also have to manually download
[PouchDB](https://github.com/pouchdb/pouchdb) and [relational-pouch](https://github.com/nolanlawson/relational-pouch).
Bower installs the dependencies automatically; the others don't.

Now that you have the `dist/` files locally, to use in your app, you just include
these dependencies in your Brocfile:

```js
app.import('vendor/pouchdb/dist/pouchdb.js');
app.import('vendor/relational-pouch/dist/pouchdb.relational-pouch.js');
app.import('vendor/ember-pouch/dist/globals/main.js');
```

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
var db = new PouchDB('http://localhost:5984/ember-todo');
db.sync('http://localhost:5984/mydb', {live: true});
```

For more info, see the official PouchDB documentation at [PouchDB.com](http://pouchdb.com).

## Build

    $ npm run build
