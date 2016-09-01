;(function() {
  'use strict';

  define('pouchdb', ['exports'], function (__exports__) {
    var PouchDB = FastBoot.require('pouchdb');

    // Register plugins!
    PouchDB.plugin(FastBoot.require('relational-pouch'));

    __exports__['default'] = PouchDB;
  });

})();
