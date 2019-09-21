const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const webpack = require('webpack');

const BUILD_ROOT = './dist';
const BUILD_PATH = `${BUILD_ROOT}/extension`;
const CODE_SOURCE_DIR = './src';

module.exports = function(env) {
  const validBuildTypes = ['beta', 'development', 'production'];
  if (!env || !validBuildTypes.includes(env.buildType)) {
    console.log(`Invalid --env.buildType provided. Must be one of: [${validBuildTypes.join('|')}]`);
    process.exit(1);
  }

  const config = {
    mode: 'none',

    entry: {
      'background/background': path.resolve(`${CODE_SOURCE_DIR}/core/browser/background/index.js`),
      'options/options': path.resolve(`${CODE_SOURCE_DIR}/core/browser/options/options.js`),
      'popup/popup': path.resolve(`${CODE_SOURCE_DIR}/core/browser/popup/index.js`),
      'content-scripts/init': path.resolve(
        `${CODE_SOURCE_DIR}/core/browser/content-scripts/init.js`
      ),
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
      extensions: ['.js', '.jsx'],
      modules: ['node_modules'],
    },

    module: {
      rules: [
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
          use: ['to-string-loader', 'css-loader'],
        },
        {
          test: /\.scss$/,
          use: ['style-loader', 'css-loader', 'sass-loader'],
        },
      ],
    },

    plugins: [
      new webpack.ProgressPlugin(),
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin([
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
          from: path.join(__dirname, `${CODE_SOURCE_DIR}/core/browser/background`),
          to: path.join(__dirname, `${BUILD_PATH}/background`),
          ignore: '**/*.js',
        },
        {
          from: path.join(__dirname, `${CODE_SOURCE_DIR}/core/browser/options`),
          to: path.join(__dirname, `${BUILD_PATH}/options`),
          ignore: '**/*.js',
        },
        {
          from: path.join(__dirname, `${CODE_SOURCE_DIR}/core/browser/popup`),
          to: path.join(__dirname, `${BUILD_PATH}/popup`),
          ignore: '**/*.js',
        },
        {
          from: path.join(__dirname, `${CODE_SOURCE_DIR}/extension/legacy/**/*.css`),
          to: path.join(__dirname, `${BUILD_PATH}/web-accessibles`),
          context: 'src/extension',
        },
        {
          from: path.join(
            __dirname,
            `${CODE_SOURCE_DIR}/extension/legacy/features/l10n/locales/*.js`
          ),
          to: path.join(__dirname, `${BUILD_PATH}/web-accessibles`),
          context: 'src/extension',
        },
      ]),
    ],
  };

  return config;
};
