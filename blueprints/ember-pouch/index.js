'use strict';

module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addBowerPackagesToProject([
      { name: 'pouchdb', target: '~3.5.0' },
      { name: 'relational-pouch', target: '~1.3.2'}
    ]);
  }
};