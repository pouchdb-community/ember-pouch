(function() {
  function vendorModule() {
    'use strict';

    return { 'default': self['PouchDB'] };
  }

  define('pouchdb', [], vendorModule);
})();
