var path = require('path');

module.exports = {
  entry: './sauce/main.js',

  // The plain compiled Javascript will be output into this file
  output: {
    filename: 'output/chrome/res/features/ynabToolkit.js'
  },

  resolve: {
    modules: [path.resolve(__dirname, 'sauce'), 'node_modules']
  },

  module: {
    loaders: [
      {
        // Only working with files that in in a .js
        test: /\.js$/,
        // Webpack will only process files in our app folder. This avoids processing
        // node modules and server files unnecessarily
        include: [
          path.resolve(__dirname, 'sauce')
        ],
        loader: 'babel-loader',
        query: {
          // These are the specific transformations we'll be using.
          presets: ['es2015']
        }
      }
    ]
  },

  devtool: 'source-map'
};
