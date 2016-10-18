/* jshint node: true */
var Plugin = require('broccoli-plugin');
var fs = require('fs');

AMDStubGenerator.prototype = Object.create(Plugin.prototype);
AMDStubGenerator.prototype.constructor = AMDStubGenerator;
function AMDStubGenerator(inputTree, options) {
  if (!(this instanceof AMDStubGenerator)) {
    return new AMDStubGenerator(inputTree, options);
  }
  options = options || {};
  Plugin.call(this, [inputTree], options);

  this.options = options;
  this.modulesMap = this.options.modules || [];
  this.fileName = this.options.amdFileName;
}

AMDStubGenerator.prototype.build = function () {
  var amdFileContent = this.modulesMap.map(function(module) {
    return _toAmd(module);
  }).join('\n');

  this._writeAMDStub(amdFileContent);
};

AMDStubGenerator.prototype._writeAMDStub = function (content) {
  if (content !== "") {
    var filePath = `${this.outputPath}/${this.fileName}`;
    fs.writeFileSync(filePath, content);
  }
};

module.exports = AMDStubGenerator;

function _toAmd(module) {
  if (typeof module === 'object') {
    var { module, resolution } = module;
  } else {
    var resolution = module;
  }

  return `define('${resolution}', function(){ return { 'default': require('${module}')};})`;
}
