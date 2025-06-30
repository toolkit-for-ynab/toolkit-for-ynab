/**
 * @type {import("semantic-release").GlobalConfig}
 */
const config = {
  branches: ['main'],
  repositoryUrl: 'https://github.com/toolkit-for-ynab/toolkit-for-ynab.git',
  tagFormat: 'v${version}',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        releaseRules: [
          {
            scope: 'no-release',
            release: false,
          },
          {
            type: 'build',
            release: 'patch',
          },
          {
            type: 'ci',
            release: 'patch',
          },
          {
            type: 'chore',
            release: 'patch',
          },
          {
            type: 'docs',
            release: 'patch',
          },
          {
            type: 'refactor',
            release: 'patch',
          },
          {
            type: 'style',
            release: 'patch',
          },
          {
            breaking: true,
            release: 'major',
          },
        ],
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        presetConfig: {
          types: [
            { type: 'feat', section: 'New Features' },
            { type: 'fix', section: 'Bug Fixes' },
            { type: 'perf', section: 'Performance Improvements', hidden: false },
            { type: 'revert', section: 'Commit Reverts', hidden: false },
            { type: 'build', section: 'Build System', hidden: false },
            { type: 'ci', section: 'Continuous Integration', hidden: false },
            { type: 'chore', section: 'Chores', hidden: false },
            { type: 'docs', section: 'Documentation', hidden: false },
            { type: 'style', section: 'Style Changes', hidden: false },
            { type: 'refactor', section: 'Code Refactoring', hidden: false },
            { type: 'test', section: 'Test Cases', hidden: true },
          ],
        },
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
        pkgRoot: '.',
      },
    ],
    [
      '@semantic-release/exec',
      {
        prepareCmd: 'rm src/manifest.json && cp src/manifest.placeholder.json src/manifest.json',
      },
    ],
    [
      'semantic-release-plugin-update-version-in-files',
      {
        files: ['src/manifest.json'],
        placeholder: '0.0.0-development',
      },
    ],
    [
      '@semantic-release/exec',
      {
        publishCmd: 'yarn build:ci-test', // UPDATE TO 'yarn build:ci' when in 'production'
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'src/manifest.json', 'docs'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
    [
      '@semantic-release/github',
      {
        assets: ['dist/*.zip'],
      },
    ],
  ],
};

module.exports = config;
