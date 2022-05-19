# Ember Pouch [![Build Status](https://travis-ci.org/pouchdb-community/ember-pouch.svg)](https://travis-ci.org/pouchdb-community/ember-pouch) [![GitHub version](https://badge.fury.io/gh/pouchdb-community%2Fember-pouch.svg)](https://badge.fury.io/gh/pouchdb-community%2Fember-pouch) [![Ember Observer Score](https://emberobserver.com/badges/ember-pouch.svg)](https://emberobserver.com/addons/ember-pouch)

[**Changelog**](#changelog)

Ember Pouch is a PouchDB/CouchDB adapter for Ember Data 2.0+. For older Ember Data versions use Ember Pouch version 3.2.2.

With Ember Pouch, all of your app's data is automatically saved on the client-side using IndexedDB or WebSQL, and you just keep using the regular [Ember Data `store` API](http://emberjs.com/api/data/classes/DS.Store.html#method_all). This data may be automatically synced to a remote CouchDB (or compatible servers) using PouchDB replication.

What's the point?
* Ember.js v3.24 or above
* Ember CLI v3.24 or above
* Node.js v12 or above


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
- `import PouchDB from 'ember-pouch/pouchdb';`
- `import {Model, Adapter, Serializer} from 'ember-pouch'`

`Ember-Pouch` requires you to add a `@attr('string') rev` field to all your models. This is for PouchDB/CouchDB to handle revisions:

```javascript
// app/models/todo.js

import Model, { attr } from '@ember-data/model';

export default class TodoModel extends Model {
  @attr('string') title;
  @attr('boolean') isCompleted;
  @attr('string') rev;               // <-- Add this to all your models
}
```

If you like, you can also use `Model` from `Ember-Pouch` that ships with the `rev` attribute:

```javascript
// app/models/todo.js

import { attr } from '@ember-data/model';
import { Model } from 'ember-pouch';

export default class TodoModel extends Model {
  @attr('string') title;
  @attr('boolean') isCompleted;
}
```

## Configuring /app/adapters/application.js

A local PouchDB that syncs with a remote CouchDB looks like this:

```javascript
// app/adapters/application.js

import PouchDB from 'ember-pouch/pouchdb';
import { Adapter } from 'ember-pouch';

let remote = new PouchDB('http://localhost:5984/my_couch');
let db = new PouchDB('local_pouch');

db.sync(remote, {
   live: true,   // do a live, ongoing sync
   retry: true   // retry if the connection is lost
});

export default class ApplicationAdapter extends Adapter {
  db = db;
}
```

You can also turn on debugging:

```javascript
import PouchDB from 'ember-pouch/pouchdb';

// For v7.0.0 and newer you must first load the 'pouchdb-debug' plugin
// see https://github.com/pouchdb/pouchdb/tree/39ac9a7a1f582cf7a8d91c6bf9caa936632283a6/packages/node_modules/pouchdb-debug
import pouchDebugPlugin from 'pouchdb-debug'; // (assumed available via ember-auto-import or shim)
PouchDB.plugin(pouchDebugPlugin);

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

To be more in line with the normal ember data way of saving `hasMany` - `belongsTo` relationships, ember-pouch now has an option to not save the child ids on the `hasMany` side. This prevents the extra need to save the `hasMany` side as explained below. For a more detailed explanation please read the [relational-pouch documentation](https://github.com/pouchdb-community/relational-pouch#dont-save-hasmany)

This new mode can be disabled for a `hasMany` relationship by specifying the option `save: true` on the relationship. An application wide setting named `ENV.emberPouch.saveHasMany` can also be set to `true` to make all `hasMany` relationships behave the old way.

Using this mode does impose a slight runtime overhead, since this will use `db.find` and database indexes to search for the child ids. The indexes are created automatically for you. But large changes to the model might require you to clean up old, unused indexes.

ℹ️ This mode is the default from version 5 onwards. Before that it was called `dontsave` and `dontsavehasmany`

### Saving child ids

When you do save child ids on the `hasMany` side, you have to follow the directions below to make sure the data is saved correctly.

#### Adding entries

When saving a `hasMany` - `belongsTo` relationship, both sides of the relationship (the child and the parent) must be saved. Note that the parent needs to have been saved at least once prior to adding children to it.

```javascript
// app/controllers/posts/post.js
import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PostController extends Controller {

@action addComment(comment, author){
    //Create the comment
    const comment = this.store.createRecord('comment',{
      comment: comment,
      author: author
    });
    //Add our comment to our existing post
    this.model.comments.pushObject(comment);
    //Save the child then the parent
    comment.save().then(() => this.model.save());
  }
}
```

#### Removing child ids

When removing a `hasMany` - `belongsTo` relationship, the children must be removed prior to the parent being removed.

```javascript
// app/controller/posts/admin.js
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { all } from 'rsvp';

export default class AdminController extends Controller {

@action deletePost(post){
    //collect the promises for deletion
    let deletedComments = [];
    //get and destroy the posts comments
    post.comments.then((comments) => {
      comments.map((comment) => {
        deletedComments.push(comment.destroyRecord());
      });
    });
    //Wait for comments to be destroyed then destroy the post
    all(deletedComments).then(() => {
      post.destroyRecord();
    });
  }
}
```

### Query and QueryRecord

query and queryRecord are relying on [pouchdb-find](https://github.com/pouchdb/pouchdb/tree/master/packages/node_modules/pouchdb-find)

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
// app/routes/smasher.js
import Route from '@ember/routing/route';

export default class SmasherRoute extends Route {
  model() {
    return this.store.query('smasher',  {
      filter: { name: 'Mario' }
    });
  }
}
```

Find all docs where doc.name === 'Mario' and doc.debut > 1990:

```javascript
// app/routes/smasher.js
import Route from '@ember/routing/route';

export default class SmasherRoute extends Route {
  model() {
    return this.store.query('smasher',  {
      filter: {
        name: 'Mario'
        debut: { $gt: 1990 }
      }
    });
  }
}
```

Sorted by doc.debut descending.

```javascript
// app/routes/smasher.js
import Route from '@ember/routing/route';

export default class SmasherRoute extends Route {
  model() {
    return this.store.query('smasher',  {
      filter: {
        name: 'Mario',
        debut: { '$gte': null }
      },
      sort: [
        { debut: 'desc' }
      ]
    })
  }
}
```

Limit to 5 documents.

```javascript
// app/routes/smasher.js
import Route from '@ember/routing/route';

export default class SmasherRoute extends Route {
  model() {
    return this.store.query('smasher',  {
      filter: {
        name: 'Mario',
        debut: { '$gte': null }
      },
      sort: [
        { debut: 'desc' }
      ],
      limit: 5
    })
  }
}
```

Skip the first 5 documents

```javascript
// app/routes/smasher.js
import Route from '@ember/routing/route';

export default class SmasherRoute extends Route {
  model() {
    return this.store.query('smasher',  {
      filter: {
        name: 'Mario',
        debut: { '$gte': null }
      },
      sort: [
        { debut: 'desc' }
      ],
      skip: 5
    })
  }
}
```

Note that this query would require a custom index including both fields `data.name` and `data.debut`.  Any field in `sort` must also be included in `filter`.  Only `$eq`, `$gt`, `$gte`, `$lt`, and `$lte` can be used when matching a custom index.

### store.queryRecord(model, options)

Find one document where doc.name === 'Mario'

```javascript
// app/routes/smasher.js
import Route from '@ember/routing/route';

export default class SmasherRoute extends Route {
  model() {
    return this.store.queryRecord('smasher',  {
      filter: { name: 'Mario' }
    });
  }
}
```

## Attachments

`Ember-Pouch` provides an `attachments` transform for your models, which makes working with attachments as simple as working with any other field.

Add a `DS.attr('attachments')` field to your model. Provide a default value for it to be an empty array.

```javascript
// myapp/models/photo-album.js
import { attr } from '@ember-data/model';
import { Model } from 'ember-pouch';

export default class PhotoAlbumModel extends Model {
  @attr('attachments', {
    defaultValue: function() {
      return [];
    }
  }) photos
}
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

```javascript
// somewhere in your controller/component:
myAlbum.photos.addObject(Ember.Object.create({
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

```javascript
  unloadedDocumentChanged: function(obj) {
    let recordTypeName = this.getRecordTypeName(this.store.modelFor(obj.type));
    this.db.rel.find(recordTypeName, obj.id).then((doc) => {
      this.store.pushPayload(recordTypeName, doc);
    });
  },
```

### Plugins

With PouchDB, you also get access to a whole host of [PouchDB plugins](http://pouchdb.com/external.html).

For example, to use the `pouchdb-authentication` plugin like this using `ember-auto-import`:
```javascript
import PouchDB from 'ember-pouch/pouchdb';
import auth from 'pouchdb-authentication';

PouchDB.plugin(auth);

```

### Relational Pouch

Ember Pouch is really just a thin layer of Ember-y goodness over [Relational Pouch](https://github.com/pouchdb-community/relational-pouch). Before you file an issue, check to see if it's more appropriate to file over there.

### Offline First

Saving data locally using PouchDB is one part of making a web application [Offline First](http://offlinefirst.org/). However, you will also need to make your static assets available offline.

There are two possible approaches to this. The first one is using the Application Cache (AP) feature. The second one is using Service Workers (SW). The Application Cache specification has been [removed from the Web standards](https://developer.mozilla.org/en-US/docs/Web/HTML/Using_the_application_cache). Mozilla now recommends to use [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers) instead.

Most browser vendors still provide support for Application Cache and are in the process of implementing Service Workers. So depending on the browsers you target, you should go for one or the other. You can track the progress via [caniuse.com](https://caniuse.com/#feat=serviceworkers).

#### 1. Application Cache

You can use [broccoli-manifest](https://github.com/racido/broccoli-manifest) to create an HTML5 `appcache.manifest` file. This By default, will allow your index.html and `assets` directory to load even if the user is offline.

#### 2. Service Workers

We recommend using [Ember Service Worker](http://ember-service-worker.com) to get started with Service Workers for your web application. The website provide's an easy to follow guide on getting started with the addon.

You can also take a look at Martin Broerse his [ember-cli-blog](https://github.com/broerse/ember-cli-blog/blob/14b95b443b851afa3632be3cbe631f055664b340/ember-cli-build.js) configuration for the plugin.

⚠️ iOS does not yet support Service Workers. If you want to make your assets available offline for an iPhone or iPad, you have to go for the Application Cache strategy. Since Jan 10, 2018, [Safari Technology Preview does support Service Workers](https://webkit.org/blog/8060/release-notes-for-safari-technology-preview-47/). It's expected to land in iOS 12, but there's no certainity about that.


### Security

An easy way to secure your Ember Pouch-using app is to ensure that data can only be fetched from CouchDB &ndash; not from some other server (e.g. in an [XSS attack](https://en.wikipedia.org/wiki/Cross-site_scripting)).

You can use the [content-security-policy](https://github.com/rwjblue/ember-cli-content-security-policy) plugin to enable Content Security Policy in Ember CLI. You also will have to set the CSP HTTP header on your backend in production.

To use, add a Content Security Policy whitelist entry to `/config/environment.js`:

```js
ENV.contentSecurityPolicy = {
  "connect-src": "'self' http://your_couch_host.com:5984"
};
```

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

import { attr, belongsTo, hasMany } from '@ember-data/model';
import { Model } from 'ember-pouch';

export default class PostModel extends Model {
  @attr('string') title;
  @attr('string') text;

  @belongsTo('author') author;
  @hasMany('comments') comments;
}

// app/models/post-summary.js

import { attr } from '@ember-data/model';
import { Model } from 'ember-pouch';

export default class PostSummaryModel extends Model {
  @attr('string') title;
}

PostSummary.reopenClass({
  documentType: 'post'
})

export default PostSummary;
```

The value for `documentType` is the camelCase version of the primary model name.

For best results, only create/update records using the full model definition. Treat the others as read-only.

## Multiple databases for the same model

In some cases it might be desirable (security related, where you want a given user to only have some informations stored on his computer) to have multiple databases for the same model of data.

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


## Eventually Consistent

Following the CouchDB consistency model, we have introduced `ENV.emberPouch.eventuallyConsistent`. This feature is on by default. So if you want the old behavior you'll have to disable this flag.

`findRecord` now returns a long running Promise if the record is not found. It only rejects the promise if a deletion of the record is found. Otherwise this promise will wait for eternity to resolve.
This makes sure that belongsTo relations that have been loaded in an unexpected order will still resolve correctly. This makes sure that ember-data does not set the belongsTo to null if the Pouch replicate would have loaded the related object later on. (This only works for async belongsTo, sync versions will need this to be implemented in relational-pouch)


## Installation

* `git clone` this repository
* `npm install`

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

And of course thanks to all our wonderful contributors, [here](https://github.com/pouchdb-community/ember-pouch/graphs/contributors) and [in Relational Pouch](https://github.com/pouchdb-community/relational-pouch/graphs/contributors)!

## Changelog
* **7.0.0**
  - Use ember-auto-import and pouchdb-browser to ease the installation process
  - relational-pouch@4.0.0
  - Use Octane Blueprints
* **6.0.0**
  - Switch to PouchDB 7.0.0
* **5.1.0**
  - Don't unloadRecord a deleted document in onChange, only mark as deleted. This fixes some bugs with hasMany arrays corrupting in newer ember-data versions. Not unloading records also seems safer for routes that have that model active.
* **5.0.1**
  - Adapter `fixDeleteBug` flag. Defaults to `true`. Fixes [https://github.com/emberjs/data/issues/4963](https://github.com/emberjs/data/issues/4963) and related issues that don't seem to work well with server side delete notifications.
  - Track newly inserted records, so `unloadedDocumentChanged` is not called for those. Otherwise a race-condition can occur where onChange is faster than the save. This can result in the document being inserted in the store via `unloadedDocumentChanged` before the save returns to ember-data. This will result in an assert that the id is already present in the store.
* **5.0.0**
  - Add warning for old `dontsavehasmany` use [#216](https://github.com/pouchdb-community/ember-pouch/pull/216)
  - forcing the default serializer [#215](https://github.com/pouchdb-community/ember-pouch/pull/215)
  - test + flag + doc for eventually-consistent [#214](https://github.com/pouchdb-community/ember-pouch/pull/214)
  - config changes [#213](https://github.com/pouchdb-community/ember-pouch/pull/213)
  - Update pouchdb to version 6.4.2 [#211](https://github.com/pouchdb-community/ember-pouch/pull/211)
* **5.0.0-beta.6**
  - Add register-version.js to vendor/ember-pouch [#210](https://github.com/pouchdb-community/ember-pouch/pull/210)
  - Update documentation about Offline First [#209](https://github.com/pouchdb-community/ember-pouch/pull/209)
* **5.0.0-beta.5**
  - Add pouchdb.find.js from pouchdb [#208](https://github.com/pouchdb-community/ember-pouch/pull/208)
  - createIndex promises should be done before removing [#208](https://github.com/pouchdb-community/ember-pouch/pull/208)
  - Change sudo to required (see travis-ci/travis-ci#8836) [#208](https://github.com/pouchdb-community/ember-pouch/pull/208)
  - Ignore same revision changes [#189](https://github.com/pouchdb-community/ember-pouch/pull/189)
* **5.0.0-beta.4**
  - Resolve Ember.String.pluralize() deprecation [#206](https://github.com/pouchdb-community/ember-pouch/pull/206)
  - allow usage of skip parameter in pouchdb adapter queries [#198](https://github.com/pouchdb-community/ember-pouch/pull/198)
* **5.0.0-beta.3**
  - Fix Ember Data canary ember-try scenario [#202](https://github.com/pouchdb-community/ember-pouch/pull/202)
  - Restore ember-try configuration for Ember Data [#201](https://github.com/pouchdb-community/ember-pouch/pull/201)
  - Fix some jobs on Travis Trusty [#187](https://github.com/pouchdb-community/ember-pouch/pull/187)
  - clean up db changes listener [#195](https://github.com/pouchdb-community/ember-pouch/pull/195)
  - filter results of pouch adapter query by correct type [#194](https://github.com/pouchdb-community/ember-pouch/pull/194)
  - allow usage of limit parameter in pouchdb adapter queries [#193](https://github.com/pouchdb-community/ember-pouch/pull/193)
* **5.0.0-beta.2**
  - version fix [#196](https://github.com/pouchdb-community/ember-pouch/pull/196)
* **5.0.0-beta.1**
  - Eventually consistency added: documents that are not in the database will result in an 'eternal' promise. This promise will only resolve when an entry for that document is found. Deleted documents will also satisfy this promise. This mirrors the way that couchdb replication works, because the changes might not come in the order that ember-data expects. Foreign keys might therefor point to documents that have not been loaded yet. Ember-data normally resets these to null, but keeping the promise in a loading state will keep the relations intact until the actual data is loaded.
* **4.3.0**
  - Bundle pouchdb-find [#191](https://github.com/pouchdb-community/ember-pouch/pull/191)
* **4.2.9**
  - Lock relational-pouch version until pouchdb-find bugs are solved
* **4.2.8**
  - Update Ember CLI and PouchDB [#186](https://github.com/pouchdb-community/ember-pouch/pull/186)
* **4.2.7**
  - Fix `_shouldSerializeHasMany` deprecation [#185](https://github.com/pouchdb-community/ember-pouch/pull/185)
* **4.2.6**
  - Fixes queryRecord deprecation [#152](https://github.com/pouchdb-community/ember-pouch/pull/152)
  - Change links to `pouchdb-community`
  - Use npm for ember-source [#183](https://github.com/pouchdb-community/ember-pouch/pull/183)
* **4.2.5**
  - Correct Security documentation [#177](https://github.com/pouchdb-community/ember-pouch/pull/177)
  - Fix sort documentation and add additional notes [#176](https://github.com/pouchdb-community/ember-pouch/pull/176)
  - update ember-getowner-polyfill to remove deprecation warnings [#174](https://github.com/pouchdb-community/ember-pouch/pull/174)
* **4.2.4**
  - Fix attachments typo in README [#170](https://github.com/pouchdb-community/ember-pouch/pull/170)
* **4.2.3**
  - Update pouchdb to the latest version
  - Minor typofix [#166](https://github.com/pouchdb-community/ember-pouch/pull/166)
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
  - Fixes [#158](https://github.com/pouchdb-community/ember-pouch/pull/158)
* **4.0.2**
  - Updated ember-cli fixes and some minor changes [#147](https://github.com/pouchdb-community/ember-pouch/pull/147)
  - Added Version badge and Ember Observer badge [#142](https://github.com/pouchdb-community/ember-pouch/pull/142)
* **4.0.0**
  - Add support for Attachments [#135](https://github.com/pouchdb-community/ember-pouch/pull/135)
  - Implement glue code for query and queryRecord using pouchdb-find [#130](https://github.com/pouchdb-community/ember-pouch/pull/130)
* **3.2.2**
  - Update Bower dependencies [#137](https://github.com/pouchdb-community/ember-pouch/pull/137)
  - Correct import of Ember Data model blueprint [#131](https://github.com/pouchdb-community/ember-pouch/pull/131)
* **3.2.1**
  - Fix(Addon): Call super in init [#129](https://github.com/pouchdb-community/ember-pouch/pull/129)
* **3.2.0**
  - Make adapter call a hook when encountering a change for a record that is not yet loaded [#108](https://github.com/pouchdb-community/ember-pouch/pull/108)
* **3.1.1**
  - Bugfix for hasMany relations by [@backspace](https://github.com/backspace) ([#111](https://github.com/pouchdb-community/ember-pouch/pull/111)).
* **3.1.0**
  - Database can now be dynamically switched on the adapter ([#89](https://github.com/pouchdb-community/ember-pouch/pull/89)). Thanks to [@olivierchatry](https://github.com/olivierchatry) for this!
  - Various bugfixes by [@backspace](https://github.com/backspace), [@jkleinsc](https://github.com/jkleinsc), [@rsutphin](https://github.com/rsutphin), [@mattmarcum](https://github.com/mattmarcum), [@broerse](https://github.com/broerse), and [@olivierchatry](https://github.com/olivierchatry). See [the full commit log](https://github.com/pouchdb-community/ember-pouch/compare/7c216311ffacd2f08b57df4fe34d49f4e7c373f1...v3.1.0) for details. Thank you!
* **3.0.1**
  - Add blueprints for model and adapter (see above for details). Thanks [@mattmarcum](https://github.com/mattmarcum) ([#101](https://github.com/pouchdb-community/ember-pouch/issues/101), [#102](https://github.com/pouchdb-community/ember-pouch/issues/102)) and [@backspace](https://github.com/backspace) ([#103](https://github.com/pouchdb-community/ember-pouch/issues/103)).
* **3.0.0**
  - Update for compatibility with Ember & Ember-Data 2.0+. The adapter now supports Ember & Ember-Data 1.13.x and 2.x only.
* **2.0.3**
  - Use Ember.get to reference the PouchDB instance property in the adapter (`db`), allowing it to be injected ([#84](https://github.com/pouchdb-community/ember-pouch/issues/84)). Thanks to [@jkleinsc](https://github.com/jkleinsc)!
  - Indicate to ember-data 1.13+ that reloading individual ember-pouch records is never necessary (due to the change
    watcher that keeps them up to date as they are modified) ([#79](https://github.com/pouchdb-community/ember-pouch/issues/79), [#83](https://github.com/pouchdb-community/ember-pouch/issues/83)).
* **2.0.2** - Use provide `findRecord` for ember-data 1.13 and later thanks to [@OleRoel](https://github.com/OleRoel) ([#72](https://github.com/pouchdb-community/ember-pouch/issues/72))
* **2.0.1** - Fixed [#62](https://github.com/pouchdb-community/ember-pouch/issues/62) thanks to [@rsutphin](https://github.com/rsutphin) (deprecated `typekey` in Ember-Data 1.0.0-beta.18)
* **2.0.0** - Ember CLI support, due to some amazing support by [@fsmanuel](https://github.com/fsmanuel)! Bower and npm support are deprecated now; you are recommended to use Ember CLI instead.
* **1.2.5** - Last release with regular Bower/npm support via bundle javascript in the `dist/` directory.
* **1.0.0** - First release
