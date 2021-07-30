const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

const BUILD_ROOT = './dist';
const BUILD_PATH = `${BUILD_ROOT}/extension`;
const CODE_SOURCE_DIR = './src';

module.exports = function (env) {
  const validBuildTypes = ['beta', 'development', 'production'];
  if (!env || !validBuildTypes.includes(env.buildType)) {
    console.log(`Invalid --env.buildType provided. Must be one of: [${validBuildTypes.join('|')}]`);
    process.exit(1);
  }

  const config = {
    mode: 'none',

    entry: {
      'background/background': path.resolve(`${CODE_SOURCE_DIR}/core/background/index.js`),
      'options/options': path.resolve(`${CODE_SOURCE_DIR}/core/options/options.js`),
      'popup/popup': path.resolve(`${CODE_SOURCE_DIR}/core/popup/index.js`),
      'content-scripts/init': path.resolve(`${CODE_SOURCE_DIR}/core/content-scripts/init.js`),
      'web-accessibles/ynab-toolkit': path.resolve(`${CODE_SOURCE_DIR}/extension/index.js`),
    },

    devtool: env.buildType !== 'production' ? 'inline-source-map' : '',

    output: {
      path: path.join(__dirname, BUILD_ROOT),
      filename: 'extension/[name].js',
    },

    resolve: {
      alias: {
        toolkit: path.resolve(__dirname, CODE_SOURCE_DIR),
        'toolkit-reports': path.resolve(
          __dirname,
          path.join(CODE_SOURCE_DIR, 'extension', 'features', 'toolkit-reports')
        ),
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      modules: ['node_modules'],
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          include: [path.resolve(__dirname, CODE_SOURCE_DIR)],
          use: [
            {
              loader: 'ts-loader',
            },
          ],
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          include: [path.resolve(__dirname, CODE_SOURCE_DIR)],
          use: [
            {
              loader: 'babel-loader',
            },
          ],
        },
        {
          test: /\.css$/,
          include: [path.resolve(__dirname, CODE_SOURCE_DIR)],
          use: [
            {
              loader: 'to-string-loader',
            },
            {
              loader: 'css-loader',
              options: {
                esModule: false,
              },
            },
          ],
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
      ],
    },

    plugins: [
      new webpack.ProgressPlugin(),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(env.buildType),
      }),
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, `${CODE_SOURCE_DIR}/assets/common`),
            to: path.join(__dirname, `${BUILD_PATH}/assets`),
          },
          {
            from: path.join(__dirname, `${CODE_SOURCE_DIR}/assets/environment/${env.buildType}`),
            to: path.join(__dirname, `${BUILD_PATH}/assets`),
          },
          {
            from: path.join(__dirname, `${CODE_SOURCE_DIR}/manifest.json`),
            to: path.join(__dirname, `${BUILD_PATH}`),
          },
          {
            from: path.join(__dirname, `${CODE_SOURCE_DIR}/core/background`),
            to: path.join(__dirname, `${BUILD_PATH}/background`),
            globOptions: { ignore: '**/*.js' },
          },
          {
            from: path.join(__dirname, `${CODE_SOURCE_DIR}/core/options`),
            to: path.join(__dirname, `${BUILD_PATH}/options`),
            globOptions: { ignore: '**/*.js' },
          },
          {
            from: path.join(__dirname, `${CODE_SOURCE_DIR}/core/popup`),
            to: path.join(__dirname, `${BUILD_PATH}/popup`),
            globOptions: { ignore: '**/*.js' },
          },
        ],
      }),
    ],
  };

  return config;
};
