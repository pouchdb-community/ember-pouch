# Ember Pouch

With the **`EmberPouch`** Ember Data Adapter, all of your app's data is automatically cached/saved client side using IndexedDB and WebSQL, and you just keep using the regular [Ember Data `store` api](http://emberjs.com/api/data/classes/DS.Store.html#method_all). 

Go [_**offline-first**_](http://offlinefirst.org/) by adding an html5 **appcache.manifest** with [**broccoli-manifest**](https://github.com/racido/broccoli-manifest), and your app will also load way faster on subsequent loads over slower connections.

## Installation

    bower install ember-pouch --save

In `Brocfile.js`:

```js
app.import('bower_components/pouchdb/dist/pouchdb.js');
app.import('bower_components/relational-pouch/dist/pouchdb.relational-pouch.js');
app.import('bower_components/ember-pouch/dist/globals/main.js');
```

This defines `window.PouchDB` and `window.EmberPouch` globally.

Currently `Ember-Pouch` needs you to **add a** `rev: DS.attr('string')` **field to all your models**. This is for Pouch/Couch to handle revisions:

```js
var Todo = DS.Model.extend({
  title       : DS.attr('string'),
  isCompleted : DS.attr('boolean'),
  rev         : DS.attr('string')    // <-- Add this to all your models
});
```

## Configuring app/adapters/application.js

### Basic adapter

Local pouch that syncs with a remote couch:
```js
/* global EmberPouch, PouchDB */

var db = new PouchDB('local_couch');
var remote = new PouchDB('http://localhost:5984');
db.sync(remote, {live: true});

export default EmberPouch.Adapter.extend({
  db: db
});
```

### Get started with this setup for easier debugging

```javascript
/* globals EmberPouch, PouchDB */

PouchDB.debug.enable('*'); // Debug output options: http://pouchdb.com/api.html#debug_mode

var db = new PouchDB('local_couch');
var remote = new PouchDB('http://foo.iriscouch.com:5984', {
  ajax: {
    timeout: 6 * 1000
  }
}); // All options: http://pouchdb.com/api.html#create_database

// Log all db events
['change', 'complete', 'uptodate', 'error', 'denied'].forEach(function(event) {
  db.on(event, function() {
    console.log('Pouch ' + event + '\'d', arguments);
  });
});

db.sync(remote, {live: true})
  .on('error', function(err) {
    // Fail:
    db.cancel();
    throw new Error('PouchDB error:' + err);
  });

export default EmberPouch.Adapter.extend({
  db: db
});
```

### Retry connecting every 3.5 seconds:

```javascript
db.sync(remote, {live: true})
  .on('error', function(err) {
    // Retry:
    setTimeout(function() {
      db.sync(remote, {live: true})
    }, 3.5 * 1000);
  });
```


### Configure dev and prod urls:
At the top of your `adapters/application.js`:
```javascript
/* globals EmberPouch, PouchDB */
import config from '../config/environment';

PouchDB.debug.enable('*'); // Debugging output options: http://pouchdb.com/api.html#debug_mode

if (!config.remote_couch) {
  throw new Error('Set a config.remote_couch url in /config/environment.js');
}

var db = new PouchDB(config.local_couch || 'local_couch');
var remote = new PouchDB(config.remote_couch, {
  ajax: {
    timeout: 6 * 1000
  }
}); // All options: http://pouchdb.com/api.html#create_database
```

And `/config/environment.js` would have something like this at the end:
```javascript
  ENV.remote_couch = 'http://localhost:5984/bloggr';
  ENV.local_couch = 'bloggr';
  if (environment === 'production') {
    ENV.baseURL = '/bloggrcouch/';
    ENV.remote_couch = 'http://foo.iriscouch.com:5984/bloggr';
  }
  ENV.contentSecurityPolicy = {
    'connect-src': "'self' " + ENV.remote_couch.substring(0, ENV.remote_couch.indexOf('/', 9))
  };
```

## Full examples:

Tom Dale's blog example using Ember CLI and EmberPouch: [broerse/ember-cli-blog](https://github.com/broerse/ember-cli-blog)


## Notes:

Currently PouchDB doesn't use localStorage unless you include an experimental plugin. Amazingly, this is only necessary to support IE ≤ 9.0 and Opera Mini. It's recommended you read more about this, what storage mechanisms modern browsers now support, and using SQLite in Cordova here: http://pouchdb.com/adapters.html

CouchDB notes:
From day one, CouchDB and it's protocol have been designed to be always Available and handle Partitioning over the network well. PouchDB/CouchDB gives you a solid way to manage conflicts. It is 'eventually consistent', but CouchDB has an api for listening to changes to the database, which can be then pushed down to the client in real-time. With PouchDB, you also get access to a whole host of [PouchDB plugins](http://pouchdb.com/external.html)

`EmberPouch` is really just a thin [150 line](https://github.com/nolanlawson/ember-pouch/blob/master/lib/pouchdb-adapter.js) layer of Ember-y goodness over [Relational Pouch](https://github.com/nolanlawson/relational-pouch). Before you file an issue, check to see if it's more appropriate to file over there.

For more on PouchDB: http://pouchdb.com

## Build

    $ npm run build

## Credits

This project was originally based on the [ember-data-hal-adapter](https://github.com/locks/ember-data-hal-adapter) by [@locks](https://github.com/locks), and I really benefited from his guidance during its creation.

And of course thanks to all our wonderful contributors, [here](https://github.com/nolanlawson/ember-pouch/graphs/contributors) and [in relational-pouch](https://github.com/nolanlawson/relational-pouch/graphs/contributors)! 


