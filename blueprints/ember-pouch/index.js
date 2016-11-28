/*jshint node:true*/
module.exports = {
  description: 'Install ember-pouch deps via Bower',
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addBowerPackagesToProject([
      { name: 'pouchdb', target: '^5.4.5' },
      { name: 'relational-pouch', target: '^1.4.5'},
      { name: 'pouchdb-find', target: '^0.10.2'}
    ]);
  }
};
