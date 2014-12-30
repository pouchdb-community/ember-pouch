'use strict';

module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
    this.addBowerPackagesToProject([
      { name: 'pouchdb', target: '~3.2.0' },
      { name: 'relational-pouch', target: '~1.2.0'}
    ]);
  }
};
