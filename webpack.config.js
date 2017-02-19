const path = require('path');
const GenerateSettings = require('./tasks/generateSettings');
const GenerateFeatureIndex = require('./tasks/generateFeatureIndex');

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
        loader: 'babel-loader?presets[]=es2015'
      }]
    }, {
      test: /\.js$/,
      include: [
        path.resolve(__dirname, 'source')
      ],
      use: [{
        loader: 'babel-loader?presets[]=es2015'
      }]
    }]
  },

  plugins: [
    new GenerateSettings(),
    new GenerateFeatureIndex()
  ],

  devtool: 'source-map'
};
