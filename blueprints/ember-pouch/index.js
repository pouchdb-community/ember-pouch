const path = require('path');

module.exports = {
  normalizeEntityName() {
    return 'application';
  },

  filesPath() {
    return path.join(this.path, '../pouch-adapter/files');
  },

  afterInstall(/*options*/) {
    this.addPackagesToProject([
      { name: 'pouchdb-core' },
      { name: 'pouchdb-adapter-indexeddb' },
      { name: 'pouchdb-adapter-http' },
      { name: 'pouchdb-mapreduce' },
      { name: 'pouchdb-replication' },
      { name: 'pouchdb-find' },
      { name: 'relational-pouch' },
    ]);
  },
};
