/* jshint node: true */
'use strict';

var RSVP = require('RSVP');

module.exports = {
  normalizeEntityName: function() {},

  afterInstall: function() {
    return RSVP.all([
      this.addBowerPackageToProject('pouchdb', '~3.2.0'),
      this.addBowerPackageToProject('relational-pouch', '~1.2.0')
    ]);
  }
};
