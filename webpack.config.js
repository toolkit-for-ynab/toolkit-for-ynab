const path = require('path');

module.exports = {
  entry: './sauce/main.js',

  output: {
    filename: 'source/common/res/features/ynabToolkit.js'
  },

  resolve: {
    alias: {
      toolkit: path.resolve(__dirname, 'sauce')
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
        path.resolve(__dirname, 'sauce')
      ],
      use: [{
        loader: 'babel-loader',
        options: {
          presets: ['env'],
          plugins: ['transform-class-properties']
        }
      }]
    }, {
      test: /\.css$/,
      include: [
        path.resolve(__dirname, 'sauce')
      ],
      use: ['to-string-loader', 'css-loader']
    }]
  }
};
