module.exports = {
  normalizeEntityName: function() {
    // allows us to run ember -g ember-cli-bootstrap and not blow up
    // because ember cli normally expects the format
    // ember generate <entitiyName> <blueprint>
  },

  afterInstall: function() {
    var addonContext = this;

    return this.addBowerPackageToProject('pouchdb', '~3.2.0')
      .then(function() {
        return addonContext.addBowerPackageToProject('relational-pouch', '~1.2.0');
      });
  }
};
