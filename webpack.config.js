const path = require('path');

module.exports = {
  entry: './sauce/main.js',

  output: {
    filename: 'source/common/res/features/ynabToolkit.js'
  },

  resolve: {
    modules: [path.resolve(__dirname, 'sauce'), 'node_modules']
  },

  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      enforce: 'pre',
      use: [{
        loader: 'eslint-loader'
      }]
    }, {
      test: /\.js$/,
      include: [
        path.resolve(__dirname, 'sauce')
      ],
      use: [{
        loader: 'babel-loader?presets[]=es2016'
      }]
    }]
  },

  devtool: 'source-map'
};
