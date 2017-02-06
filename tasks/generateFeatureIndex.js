const path = require('path');

function GenerateFeatureIndex() {
  this.startTime = Date.now();
}

GenerateFeatureIndex.prototype.apply = function (compiler) {
  compiler.plugin('emit', function(compilation, callback) {
    fs.readdir()

    callback();
  });
}

module.exports = GenerateFeatureIndex;
