# Ember Pouch

With the **`EmberPouch`** Ember Data Adapter, all of your app's data is automatically saved client side using IndexedDB or WebSQL, and you just keep using the regular [Ember Data `store` api](http://emberjs.com/api/data/classes/DS.Store.html#method_all). 

Go [_**offline-first**_](http://offlinefirst.org/) by adding an html5 **appcache.manifest** with [**broccoli-manifest**](https://github.com/racido/broccoli-manifest), and your app will also load way faster on subsequent loads over slower connections.

## Install and setup

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

Add a Content Security Policy whitelisting your couch's hostname in `/config/environment.js`:
```javascript
  ENV.contentSecurityPolicy = {
    "connect-src": "'self' " + (ENV.couch_hostname = "http://localhost:5984")
  };
```
(Ember CLI includes the [content-security-policy](https://github.com/rwjblue/ember-cli-content-security-policy) plugin by default to ensure that CSP is kept in the forefront of your thoughts, you still have actually to set the content security policy http header on your backend in production)

## Configuring /app/adapters/application.js

A local pouch that syncs with a remote couch looks like this:
```js
var remote = new PouchDB('http://localhost:5984/my_couch');
var local  = new PouchDB('local_couch');
export default EmberPouch.Adapter.extend({
  db: local.sync(remote)
});
```

But you will certainly prefer this more complete adapter setup for easier debugging:

```javascript
/* globals EmberPouch, PouchDB */
import config from '../config/environment';

PouchDB.debug.enable('*'); // Debug output options: http://pouchdb.com/api.html#debug_mode

var local  = new PouchDB('local_couch');
var remote = new PouchDB(config.couch_hostname + '/my_couch', {
  ajax: {
    timeout: 6 * 1000
  }
}); // All options: http://pouchdb.com/api.html#create_database

// Log all db events
['change', 'complete', 'uptodate', 'error', 'denied'].forEach(function(event) {
  local.on(event, function() {
    console.log('Pouch ' + event + '\'d', arguments);
  });
});

export default EmberPouch.Adapter.extend({
  db: local.sync(remote, {live: true})
        .on('error', function(err) {
          // Retry connecting every 3.8 seconds:
          setTimeout(function() {
            db.sync(remote, {live: true})
          }, 3.8 * 1000);

          // Fail:
          //db.cancel();
          //throw new Error('PouchDB error:' + err);
        });
});
```

Congrats! Now you can go crazy with the [Ember Data `store` api](http://emberjs.com/api/data/classes/DS.Store.html#method_all) and you should be able to use the app offline if you have included an appcache.manifest.

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
