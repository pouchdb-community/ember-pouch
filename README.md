# Ember Pouch

With the **`EmberPouch`** Ember Data Adapter, your Ember app's data is automatically cached/saved client side using whatever storage mechanisms are available (IndexedDB, WebSQL), and you're setup to easily sync with any backend implementing the CouchDB protocol. Throw in an html5 **appcache.manifest** with [**broccoli-manifest**](https://github.com/racido/broccoli-manifest) and now you have a highly functional [_**offline-first**_](http://offlinefirst.org/) web **App**. Your web app will load faster than even the lightest javascript apps because it's reading from the local disk; only using the network for data requests and transparent background updates. Stop stressing over how many kilobytes your page is!

And with Ember-cli, you're only a few steps away from delivering a native app using these [cordova addons](http://www.emberaddons.com/#/?q=cordova).

Currently PouchDB doesn't use localStorage unless you include an experimental plugin. Amazingly, this is only necessary to support IE ≤ 9.0 and Opera Mini. It's recommended you read more about this, what storage mechanisms modern browsers now support, and using SQLite in Cordova here: http://pouchdb.com/adapters.html

CouchDB notes:
From day one, CouchDB and it's protocol have been designed to be always Available and handle Partitioning over the network well. PouchDB/CouchDB gives you a solid way to manage conflicts. It is 'eventually consistent', but CouchDB has an api for listening to changes to the database, which can be then pushed down to the client in real-time. With PouchDB, you also get access to a whole host of [PouchDB plugins](http://pouchdb.com/external.html)

This module is really just a thin layer of Ember-y goodness over [Relational Pouch](https://github.com/nolanlawson/relational-pouch). Before you file an issue, please check to see if it's more appropriate to file over there.

## Installation

    bower install ember-pouch --save

In `Brocfile.js`:

```js
app.import('bower_components/pouchdb/dist/pouchdb.js');
app.import('bower_components/relational-pouch/dist/pouchdb.relational-pouch.js');
app.import('bower_components/ember-pouch/dist/globals/main.js');
```

This defines `window.PouchDB` and `window.EmberPouch` globally.

In `app/adapters/application.js`:

```js
/* global EmberPouch, PouchDB */

export default EmberPouch.Adapter.extend({
  db: new PouchDB('mydb') // See: http://pouchdb.com/api.html#create_database for options
});
```

Currently `Ember-Pouch` needs you to **add a** `rev: DS.attr('string')` **field to all your models**. This is for Pouch/Couch to handle revisions:

```js
var Todo = DS.Model.extend({
  title       : DS.attr('string'),
  isCompleted : DS.attr('boolean'),
  rev         : DS.attr('string')    // <-- Add this to all your models
});
```

## Usage

You can now use PouchDB as a local database that syncs with CouchDB:

```js
/* global EmberPouch, PouchDB */
// app/adapters/application.js
PouchDB.debug.enable('*');

var db     = new PouchDB('mydb'); // Local
var remote = new PouchDB('http://localhost:5984/mydb', {ajax: {timeout: 20000}});

var dbSync = function() {
  db.sync(remote, {live: true})
    .on('error', function (err) {
      setTimeout(dbSync, 2 * 1000); // retry
    });
};
dbSync();
window.dbSync = dbSync;

export default EmberPouch.Adapter.extend({
  db: db
});
```

Example: https://github.com/broerse/ember-cli-blog

For more on `EmberPouch`, there are only 150 meaningful lines of code for this project located here: https://github.com/nolanlawson/ember-pouch/blob/master/lib/pouchdb-adapter.js
Everything else is handled in the `Relational-Pouch` PouchDB plugin, read those api docs here: https://github.com/nolanlawson/relational-pouch#api

For more on PouchDB: [PouchDB.com](http://pouchdb.com).

## Common errors:

If you forget to add a `rev` field to a model, you will see the error:

    Failed to load resource: the server responded with a status of 409 (Conflict)

in your console.


## Build

    $ npm run build

## Related projects:

- [taras/ember-pouchdb](https://github.com/taras/ember-pouchdb)

## Credits

This project was originally based on the [ember-data-hal-adapter](https://github.com/locks/ember-data-hal-adapter) by [@locks](https://github.com/locks), and I really benefited from his guidance during its creation.

And of course thanks to all our wonderful contributors, [here](https://github.com/nolanlawson/ember-pouch/graphs/contributors) and [in relational-pouch](https://github.com/nolanlawson/relational-pouch/graphs/contributors)! 

