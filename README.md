# Ember Pouch [![Build Status](https://travis-ci.org/nolanlawson/ember-pouch.svg)](https://travis-ci.org/nolanlawson/ember-pouch) [![GitHub version](https://badge.fury.io/gh/nolanlawson%2Fember-pouch.svg)](https://badge.fury.io/gh/nolanlawson%2Fember-pouch) [![Ember Observer Score](https://emberobserver.com/badges/ember-pouch.svg)](https://emberobserver.com/addons/ember-pouch)

[**Changelog**](#changelog)

Ember Pouch is a PouchDB/CouchDB adapter for Ember Data 2.0+. For older Ember Data versions use Ember Pouch version 3.2.2.

With Ember Pouch, all of your app's data is automatically saved on the client-side using IndexedDB or WebSQL, and you just keep using the regular [Ember Data `store` API](http://emberjs.com/api/data/classes/DS.Store.html#method_all). This data may be automatically synced to a remote CouchDB (or compatible servers) using PouchDB replication.

What's the point?

1. You don't need to write any server-side logic. Just use CouchDB.

2. Data syncs automatically.

3. Your app works offline, and requests are super fast, because they don't need the network.

For more on PouchDB, check out [pouchdb.com](http://pouchdb.com).

## Install and setup

```bash
ember install ember-pouch
```

For ember-data < 2.0:

```bash
ember install ember-pouch@3.2.2
```

For ember-cli < 1.13.0:

```bash
npm install ember-pouch@3.2.2 --save-dev
```

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
   retry: true   // retry if the connection is lost
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
ENV.emberPouch.remoteDb = 'http://localhost:5984/my_couch';
```

## Relationships

EmberPouch supports both `hasMany` and `belongsTo` relationships.

### Don't save hasMany child ids

To be more in line with the normal ember data way of saving `hasMany` - `belongsTo` relationships, ember-pouch now has an option to not save the child ids on the `hasMany` side. This prevents the extra need to save the `hasMany` side as explained below. For a more detailed explanation please read the [relational-pouch documentation](https://github.com/nolanlawson/relational-pouch#dont-save-hasmany)

This new mode can be selected for a `hasMany` relationship by specifying the option `dontsave: true` on the relationship. An application wide setting named `ENV.emberpouch.dontsavehasmany` can also be set to `true` to make all `hasMany` relationships behave this way.

Using this mode does impose a slight runtime overhead, since this will use `db.find` and database indexes to search for the child ids. The indexes are created automatically for you. But large changes to the model might require you to clean up old, unused indexes.

### Saving child ids

When you do save child ids on the `hasMany` side, you have to follow the directions below to make sure the data is saved correctly.

#### Adding entries

When saving a `hasMany` - `belongsTo` relationship, both sides of the relationship (the child and the parent) must be saved. Note that the parent needs to have been saved at least once prior to adding children to it.

```javascript
// app/routes/post/index.js
import Ember from 'ember';

export default Ember.Route.extend({
  model(params){
    //We are getting a post that already exists
    return this.store.findRecord('post',  params.post_id);
  },

  actions:{
    addComment(comment, author){
      //Create the comment
      const comment = this.store.createRecord('comment',{
        comment: comment,
        author: author
      });
      //Get our post
      const post = this.controller.get('model');
      //Add our comment to our existing post
      post.get('comments').pushObject(comment);
      //Save the child then the parent
      comment.save().then(() => post.save());
    }
  }
});

```

#### Removing child ids

When removing a `hasMany` - `belongsTo` relationship, the children must be removed prior to the parent being removed.

```javascript
// app/routes/posts/admin/index.js
import Ember from 'ember';

export default Ember.Route.extend({
  model(){
    //We are getting all posts for some sort of list
    return this.store.findAll('post');
  },

  actions:{
    deletePost(post){
      //collect the promises for deletion
      let deletedComments = [];
      //get and destroy the posts comments
      post.get('comments').then((comments) => {
        comments.map((comment) => {
          deletedComments.push(comment.destroyRecord());
        });
      });
      //Wait for comments to be destroyed then destroy the post
      Ember.RSVP.all(deletedComments).then(() => {
        post.destroyRecord();
      });
    }
  }
});
```

### Query and QueryRecord

query and queryRecord are relying on [pouchdb-find](https://github.com/nolanlawson/pouchdb-find)

### db.createIndex(index [, callback])

Create an index if it doesn't exist.

```javascript
// app/adapters/application.js
function createDb() {
  ...

  db.createIndex({
    index: {
      fields: ['data.name']
    }
  }).then((result) => {
    // {'result': 'created'} index was created
  });

  return db;
};
```

### store.query(model, options)

Find all docs where doc.name === 'Mario'

```javascript
// app/routes/smasher/index.js
import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.store.query('smasher',  {
      filter: { name: 'Mario' }
    });
  }
});
```

Find all docs where doc.name === 'Mario' and doc.debut > 1990:

```javascript
// app/routes/smasher/index.js
import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.store.query('smasher',  {
      filter: {
        name: 'Mario'
        debut: { $gt: 1990 }
      }
    });
  }
});
```

Sorted by doc.debut descending.

```javascript
// app/routes/smasher/index.js
import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.store.query('smasher',  {
      filter: {
        name: 'Mario'
        sort: [
          { debut: 'desc' }
        ]
      }
    })
  }
});
```

### store.queryRecord(model, options)

Find one document where doc.name === 'Mario'

```javascript
// app/routes/smasher/index.js
import Ember from 'ember';

export default Ember.Route.extend({
  model() {
    return this.store.queryRecord('smasher',  {
      filter: { name: 'Mario' }
    });
  }
});
```

## Attachments

`Ember-Pouch` provides an `attachments` transform for your models, which makes working with attachments as simple as working with any other field.

Add a `DS.attr('attachments')` field to your model. Provide a default value for it to be an empty array.

```js
// myapp/models/photo-album.js
export default DS.Model.extend({
  photos: DS.attr('attachments', {
    defaultValue: function() {
      return [];
    }
  });
});
```

Here, instances of `PhotoAlbum` have a `photos` field, which is an array of plain `Ember.Object`s, which have a `.name` and `.content_type`. Non-stubbed attachment also have a `.data` field; and stubbed attachments have a `.stub` instead.
```handlebars
<ul>
  {{#each myalbum.photos as |photo|}}
    <li>{{photo.name}}</li>
  {{/each}}
</ul>
```

Attach new files by adding an `Ember.Object` with a `.name`, `.content_type` and `.data` to array of attachments.

```js
// somewhere in your controller/component:
myAlbum.get('photos').addObject(Ember.Object.create({
  'name': 'kitten.jpg',
  'content_type': 'image/jpg',
  'data': btoa('hello world') // base64-encoded `String`, or a DOM `Blob`, or a `File`
}));
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

If you have a model or two that you know will always have a small number of records, you can tell ember-data to automatically load them into memory as they arrive. Your PouchAdapter subclass has a method `unloadedDocumentChanged`, which is called when a document is received during sync that has not been loaded into the ember-data store. In your subclass, you can implement the following to load it automatically:

```js
  unloadedDocumentChanged: function(obj) {
    let store = this.get('store');
    let recordTypeName = this.getRecordTypeName(store.modelFor(obj.type));
    this.get('db').rel.find(recordTypeName, obj.id).then(function(doc) {
      store.pushPayload(recordTypeName, doc);
    });
  },
```

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

An easy way to secure your Ember Pouch-using app is to ensure that data can only be fetched from CouchDB &ndash; not from some other server (e.g. in an [XSS attack](https://en.wikipedia.org/wiki/Cross-site_scripting)).

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

## Multiple databases for the same model

In some cases it might diserable (security related, where you want a given user to only have some informations stored on his computer) to have multiple databases for the same model of data.

`Ember-Pouch` allows you to dynamically change the database a model is using by calling the function `changeDb` on the adapter.

```javascript
function changeProjectDatabase(dbName, dbUser, dbPassword) {
  // CouchDB is serving at http://localhost:5455
  let remote = new PouchDB('http://localhost:5455/' + dbName);
  // here we are using pouchdb-authentication for credential supports
  remote.login( dbUser, dbPassword).then(
    function (user) {
      let db = new PouchDB(dbName)
      db.sync(remote, {live:true, retry:true})
      // grab the adapter, it can be any ember-pouch adapter.
      let adapter = this.store.adapterFor('project');
      // this is where we told the adapter to change the current database.
      adapter.changeDb(db);
    }
  )
}
```


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
* **4.2.3**
  - Update pouchdb to the latest version
  - Minor typofix [#166](https://github.com/nolanlawson/ember-pouch/pull/166)
* **4.2.2**
  - Update pouchdb to the latest version
* **4.2.1**
  - Fix `Init` some more
  - Fix `Init` `_super.Init` error
* **4.2.0**
  - Switch to npm versions
* **4.1.0**
  - async is now true when not specified for relationships
  - hasMany relationship can have option dontsave
* **4.0.3**
  - Fixes [#158](https://github.com/nolanlawson/ember-pouch/pull/158)
* **4.0.2**
  - Updated ember-cli fixes and some minor changes [#147](https://github.com/nolanlawson/ember-pouch/pull/147)
  - Added Version badge and Ember Observer badge [#142](https://github.com/nolanlawson/ember-pouch/pull/142)
* **4.0.0**
  - Add support for Attachments [#135](https://github.com/nolanlawson/ember-pouch/pull/135)
  - Implement glue code for query and queryRecord using pouchdb-find [#130](https://github.com/nolanlawson/ember-pouch/pull/130)
* **3.2.2**
  - Update Bower dependencies [#137](https://github.com/nolanlawson/ember-pouch/pull/137)
  - Correct import of Ember Data model blueprint [#131](https://github.com/nolanlawson/ember-pouch/pull/131)
* **3.2.1**
  - Fix(Addon): Call super in init [#129](https://github.com/nolanlawson/ember-pouch/pull/129)
* **3.2.0**
  - Make adapter call a hook when encountering a change for a record that is not yet loaded [#108](https://github.com/nolanlawson/ember-pouch/pull/108)
* **3.1.1**
  - Bugfix for hasMany relations by [@backspace](https://github.com/backspace) ([#111](https://github.com/nolanlawson/ember-pouch/pull/111)).
* **3.1.0**
  - Database can now be dynamically switched on the adapter ([#89](https://github.com/nolanlawson/ember-pouch/pull/89)). Thanks to [@olivierchatry](https://github.com/olivierchatry) for this!
  - Various bugfixes by [@backspace](https://github.com/backspace), [@jkleinsc](https://github.com/jkleinsc), [@rsutphin](https://github.com/rsutphin), [@mattmarcum](https://github.com/mattmarcum), [@broerse](https://github.com/broerse), and [@olivierchatry](https://github.com/olivierchatry). See [the full commit log](https://github.com/nolanlawson/ember-pouch/compare/7c216311ffacd2f08b57df4fe34d49f4e7c373f1...v3.1.0) for details. Thank you!
* **3.0.1**
  - Add blueprints for model and adapter (see above for details). Thanks [@mattmarcum](https://github.com/mattmarcum) ([#101](https://github.com/nolanlawson/ember-pouch/issues/101), [#102](https://github.com/nolanlawson/ember-pouch/issues/102)) and [@backspace](https://github.com/backspace) ([#103](https://github.com/nolanlawson/ember-pouch/issues/103)).
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
