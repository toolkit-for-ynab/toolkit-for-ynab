function GenerateFeatureIndex() {
  this.startTime = Date.now();
}

GenerateFeatureIndex.prototype.apply = function (compiler) {
  compiler.plugin('emit', function (compilation, callback) {
    callback();
  });
};

module.exports = GenerateFeatureIndex;
