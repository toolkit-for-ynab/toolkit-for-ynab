const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const BUILD_ROOT = './dist';
const CODE_SOURCE_DIR = './src';

module.exports = {
  entry: {
    'background/background': path.resolve(`${CODE_SOURCE_DIR}/core/browser/background/index.js`),
    'options/options': path.resolve(`${CODE_SOURCE_DIR}/core/browser/options/options.js`),
    'popup/popup': path.resolve(`${CODE_SOURCE_DIR}/core/browser/popup/index.js`),
    'content-scripts/init': path.resolve(`${CODE_SOURCE_DIR}/core/browser/content-scripts/init.js`),
    'web-accessibles/ynab-toolkit': path.resolve(`${CODE_SOURCE_DIR}/extension/ynab-toolkit.js`)
  },

  devtool: 'source-map',

  output: {
    path: path.join(__dirname, BUILD_ROOT),
    filename: '[name].js'
  },

  resolve: {
    alias: {
      toolkit: path.resolve(__dirname, CODE_SOURCE_DIR)
    },
    modules: ['node_modules']
  },

  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      include: [
        path.resolve(__dirname, CODE_SOURCE_DIR)
      ],
      use: [{
        loader: 'babel-loader'
      }]
    }, {
      test: /\.css$/,
      include: [
        path.resolve(__dirname, CODE_SOURCE_DIR)
      ],
      use: ['to-string-loader', 'css-loader']
    }]
  },

  plugins: [
    new CleanWebpackPlugin(BUILD_ROOT),
    new CopyWebpackPlugin([
      { from: path.join(__dirname, `${CODE_SOURCE_DIR}/assets`), to: path.join(__dirname, `${BUILD_ROOT}/assets`) },
      { from: path.join(__dirname, `${CODE_SOURCE_DIR}/manifest.json`), to: path.join(__dirname, `${BUILD_ROOT}`) },
      { from: path.join(__dirname, `${CODE_SOURCE_DIR}/core/browser/background`), to: path.join(__dirname, `${BUILD_ROOT}/background`), ignore: '**/*.js' },
      { from: path.join(__dirname, `${CODE_SOURCE_DIR}/core/browser/options`), to: path.join(__dirname, `${BUILD_ROOT}/options`), ignore: '**/*.js' },
      { from: path.join(__dirname, `${CODE_SOURCE_DIR}/core/browser/popup`), to: path.join(__dirname, `${BUILD_ROOT}/popup`), ignore: '**/*.js' }
    ])
  ]
};
