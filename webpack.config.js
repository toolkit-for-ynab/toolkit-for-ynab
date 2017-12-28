const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const BUILD_PATH = './dist';
const CODE_SOURCE_DIR = './sauce';

module.exports = {
  entry: {
    background: path.resolve(`${CODE_SOURCE_DIR}/core/browser/background/background.js`),
    options: path.resolve(`${CODE_SOURCE_DIR}/core/browser/options/options.js`),
    popup: path.resolve(`${CODE_SOURCE_DIR}/core/browser/popup/popup.js`),
    init: path.resolve(`${CODE_SOURCE_DIR}/core/extension/init.js`),
    toolkit: path.resolve(`${CODE_SOURCE_DIR}/extension/toolkit.js`)
  },

  output: {
    path: path.join(__dirname, BUILD_PATH),
    filename: '[name]/[name].js'
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
      enforce: 'pre',
      use: [{
        loader: 'eslint-loader'
      }]
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      include: [
        path.resolve(__dirname, CODE_SOURCE_DIR)
      ],
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['env'],
          plugins: [
            'transform-class-properties',
            'transform-object-rest-spread'
          ]
        }
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
    new CleanWebpackPlugin(BUILD_PATH),
    new CopyWebpackPlugin([
      { from: path.join(__dirname, `${CODE_SOURCE_DIR}/assets`), to: path.join(__dirname, `${BUILD_PATH}/assets`) },
      { from: path.join(__dirname, `${CODE_SOURCE_DIR}/manifest.json`), to: path.join(__dirname, `${BUILD_PATH}`) },
      { from: path.join(__dirname, `${CODE_SOURCE_DIR}/core/browser/background`), to: path.join(__dirname, `${BUILD_PATH}/background`), ignore: '**/*.js' },
      { from: path.join(__dirname, `${CODE_SOURCE_DIR}/core/browser/options`), to: path.join(__dirname, `${BUILD_PATH}/options`), ignore: '**/*.js' },
      { from: path.join(__dirname, `${CODE_SOURCE_DIR}/core/browser/popup`), to: path.join(__dirname, `${BUILD_PATH}/popup`), ignore: '**/*.js' }
    ])
  ]
};
