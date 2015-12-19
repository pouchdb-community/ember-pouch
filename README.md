# Ember Pouch

[![Build Status](https://travis-ci.org/nolanlawson/ember-pouch.svg)](https://travis-ci.org/nolanlawson/ember-pouch)

[**Changelog**](#changelog)

Ember Pouch is a PouchDB/CouchDB adapter for Ember Data 1.13+.

With Ember Pouch, all of your app's data is automatically saved on the client-side using IndexedDB or WebSQL, and you just keep using the regular [Ember Data `store` API](http://emberjs.com/api/data/classes/DS.Store.html#method_all). This data may be automatically synced to a remote CouchDB (or compatible servers) using PouchDB replication.

What's the point?

1. You don't need to write any server-side logic. Just use CouchDB.

2. Data syncs automatically.

3. Your app works offline, and requests are super fast, because they don't need the network.

For more on PouchDB, check out [pouchdb.com](http://pouchdb.com).

## Install and setup

    ember install ember-pouch

This provides
- `import PouchDB from 'pouchdb'`
- `import {Model, Adapter, Serializer} from 'ember-pouch'`

`Ember-Pouch` requires you to add a `rev: DS.attr('string')` field to all your models. This is for PouchDB/CouchDB to handle revisions:

```js
// app/models/todo.js

import DS from 'ember-data';

export default DS.Model.extend({
  title       : DS.attr('string'),
  isCompleted : DS.attr('boolean'),
  rev         : DS.attr('string')    // <-- Add this to all your models
});
```

If you like, you can also use `Model` from `Ember-Pouch` that ships with the `rev` attribute:

```js
// app/models/todo.js

import DS from 'ember-data';
import { Model } from 'ember-pouch';

export default Model.extend({
  title       : DS.attr('string'),
  isCompleted : DS.attr('boolean')
});
```

## Configuring /app/adapters/application.js

A local PouchDB that syncs with a remote CouchDB looks like this:

```js
// app/adapters/application.js

import PouchDB from 'pouchdb';
import { Adapter } from 'ember-pouch';

var remote = new PouchDB('http://localhost:5984/my_couch');
var db = new PouchDB('local_pouch');

db.sync(remote, {
   live: true,   // do a live, ongoing sync
   retry: true   // retry if the conection is lost
});

export default Adapter.extend({
  db: db
});
```

You can also turn on debugging:

```js
import PouchDB from 'pouchdb';

PouchDB.debug.enable('*');
```

See the [PouchDB sync API](http://pouchdb.com/api.html#sync) for full usage instructions.

## EmberPouch Blueprints

### Adapter

You can now create an adapter using ember-cli's blueprint functionality.  Once you've installed `ember-pouch` into your ember-cli app you can run the following command to automatically generate an application adapter.

```
ember g pouch-adapter application
```

Now you can store your localDb and remoteDb names in your ember-cli's config.  Just add the following keys to the `ENV` object:

```javascript
ENV.emberPouch.localDb = 'test';
ENV.emberPouch.remoteDB = 'http://localhost:5984/my_couch';
```

### Model

In order to create a model run the following command from the command line:

```
ember g pouch-model <model-name>
```

Replace `<model-name>` with the name of your model and the file will automatically be generated for you.

### Adapter

You can now create an adapter using ember-cli's blueprint functionality.  Once you've installed `ember-pouch` into your ember-cli app you can run the following command to automatically generate an application adapter.

```
ember g pouch-adapter application
```

Now you can store your localDb and remoteDb names in your ember-cli's config.  Just add the following keys to the `ENV` object:

```javascript
ENV.emberPouch.localDb = 'test';
ENV.emberPouch.remoteDB = 'http://localhost:5984/my_couch';
```

## Sample app

Tom Dale's blog example using Ember CLI and EmberPouch: [broerse/ember-cli-blog](https://github.com/broerse/ember-cli-blog)


## Notes

### LocalStorage

Currently PouchDB doesn't use LocalStorage unless you include an experimental plugin. Amazingly, this is only necessary to support IE ≤ 9.0 and Opera Mini. It's recommended you read more about this, what storage mechanisms modern browsers now support, and using SQLite in Cordova on [the PouchDB adapters page](http://pouchdb.com/adapters.html).

### CouchDB

From day one, CouchDB and its protocol have been designed to be always **A**vailable and handle **P**artitioning over the network well (AP in the CAP theorem). PouchDB/CouchDB gives you a solid way to manage conflicts. It is "eventually consistent," but CouchDB has an API for listening to changes to the database, which can be then pushed down to the client in real-time.

To learn more about how CouchDB sync works, check out [the PouchDB guide to replication](http://pouchdb.com/guides/replication.html).

### Sync and the ember-data store

Out of the box, ember-pouch includes a PouchDB [change listener](http://pouchdb.com/guides/changes.html) that automatically updates any records your app has loaded when they change due to a sync. It also unloads records that are removed due to a sync.

However, ember-pouch does not automatically load new records that arrive during a sync. The records are saved in the local database, but **ember-data is not told to load them into memory**. Automatically loading every new record works well with a small number of records and a limited number of models. As an app grows, automatically loading every record will negatively impact app responsiveness during syncs (especially the first sync). To avoid puzzling slowdowns, ember-pouch only automatically reloads records you have already used ember-data to load.

If you have a model or two that you know will always have a small number of records, you can write your own change listener to tell ember-data to automatically load them into memory as they arrive.

### Plugins

With PouchDB, you also get access to a whole host of [PouchDB plugins](http://pouchdb.com/external.html).

For example, to use the `pouchdb-authentication` plugin, follow the install instructions and import it in your `Brocfile.js`:
```js
app.import('bower_components/pouchdb-authentication/dist/pouchdb.authentication.js');
```

### Relational Pouch

Ember Pouch is really just a thin layer of Ember-y goodness over [Relational Pouch](https://github.com/nolanlawson/relational-pouch). Before you file an issue, check to see if it's more appropriate to file over there.

### Offline first

If you want to go completely [offline-first](http://offlinefirst.org/), you'll also need an HTML5 appcache.manifest with [broccoli-manifest](https://github.com/racido/broccoli-manifest). This will allow your HTML/CSS/JS assets to load even if the user is offline. Plus your users can "add to homescreen" on a mobile device (iOS/Android).

### Security

An easy way to secure your Ember Pouch-using app is to ensure that data can only be fetched from CouchDB &ndash; not from some other sever (e.g. in an [XSS attack](https://en.wikipedia.org/wiki/Cross-site_scripting)).

To do so, add a Content Security Policy whitelist entry to `/config/environment.js`:

```js
ENV.contentSecurityPolicy = {
  "connect-src": "'self' http://your_couch_host.com:5984"
};
```

Ember CLI includes the [content-security-policy](https://github.com/rwjblue/ember-cli-content-security-policy) plugin by default to ensure that CSP is kept in the forefront of your thoughts. You still have actually to set the CSP HTTP header on your backend in production.

### CORS setup (important!)

To automatically set up your remote CouchDB to use CORS, you can use the plugin [add-cors-to-couchdb](https://github.com/pouchdb/add-cors-to-couchdb):

```
npm install -g add-cors-to-couchdb
add-cors-to-couchdb http://your_couch_host.com:5984 -u your_username -p your_password
```

### Multiple models for the same data

Ember-data can be slow to load large numbers of records which have lots of relationships. If you run into this problem, you can define multiple models and have them all point to the same set of records by defining `documentType` on the model class. Example (in an ember-cli app):

```javascript
// app/models/post.js

import DS from 'ember-data';
import { Model } from 'ember-pouch';

export default Model.extend({
    title: DS.attr('string'),
    text: DS.attr('string'),

    author: DS.belongsTo('author'),
    comments: DS.hasMany('comments')
});


// app/models/post-summary.js

import DS from 'ember-data';
import { Model } from 'ember-pouch';

var PostSummary = Model.extend({
    title: DS.attr('string'),
});

PostSummary.reopenClass({
  documentType: 'post'
})

export default PostSummary;
```

The value for `documentType` is the camelCase version of the primary model name.

For best results, only create/update records using the full model definition. Treat the others as read-only.

## Installation

* `git clone` this repository
* `npm install`
* `bower install`

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).

## Credits

This project was originally based on the [ember-data-hal-adapter](https://github.com/locks/ember-data-hal-adapter) by [@locks](https://github.com/locks), and I really benefited from his guidance during its creation.

And of course thanks to all our wonderful contributors, [here](https://github.com/nolanlawson/ember-pouch/graphs/contributors) and [in Relational Pouch](https://github.com/nolanlawson/relational-pouch/graphs/contributors)!

## Changelog

* **3.0.0**
  - Update for compatibility with Ember & Ember-Data 2.0+. The adapter now supports Ember & Ember-Data 1.13.x and 2.x only.
* **2.0.3**
  - Use Ember.get to reference the PouchDB instance property in the adapter (`db`), allowing it to be injected ([#84](https://github.com/nolanlawson/ember-pouch/issues/84)). Thanks to [@jkleinsc](https://github.com/jkleinsc)!
  - Indicate to ember-data 1.13+ that reloading individual ember-pouch records is never necessary (due to the change
    watcher that keeps them up to date as they are modified) ([#79](https://github.com/nolanlawson/ember-pouch/issues/79), [#83](https://github.com/nolanlawson/ember-pouch/issues/83)).
* **2.0.2** - Use provide `findRecord` for ember-data 1.13 and later thanks to [@OleRoel](https://github.com/OleRoel) ([#72](https://github.com/nolanlawson/ember-pouch/issues/72))
* **2.0.1** - Fixed [#62](https://github.com/nolanlawson/ember-pouch/issues/62) thanks to [@rsutphin](https://github.com/rsutphin) (deprecated `typekey` in Ember-Data 1.0.0-beta.18)
* **2.0.0** - Ember CLI support, due to some amazing support by [@fsmanuel](https://github.com/fsmanuel)! Bower and npm support are deprecated now; you are recommended to use Ember CLI instead.
* **1.2.5** - Last release with regular Bower/npm support via bundle javascript in the `dist/` directory.
* **1.0.0** - First release
