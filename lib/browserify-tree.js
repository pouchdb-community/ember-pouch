/* jshint node: true */
var AMDStubGenerator = require('./amd-stub-generator.js');
var Watchify = require('broccoli-watchify');

const amdFileName = 'amd-to-browserify.js';

function browserifyTree(tree, options) {

  var amdTree = new AMDStubGenerator(tree, {
    modules: options.modules,
    amdFileName
  });

  return new Watchify(amdTree, {
    browserify: {
      entries: [`./${amdFileName}`]
    },
    cache: true,
    outputFile: options.outputFile || 'pouchdb-browserify.js'
  });
}

module.exports = browserifyTree;
