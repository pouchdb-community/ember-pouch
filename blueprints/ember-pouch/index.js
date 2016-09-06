'use strict';

module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addBowerPackagesToProject([
      { name: 'pouchdb', target: '^5.4.5' },
      { name: 'relational-pouch', target: '^1.4.4'},
      { name: 'pouchdb-find', target: '^0.10.2'}
    ]);
  }
};
