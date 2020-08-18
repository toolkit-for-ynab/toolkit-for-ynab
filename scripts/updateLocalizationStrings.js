const glob = require('glob');
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');
const exec = require('child_process').exec;
const jsx = require('acorn-jsx');
const classFields = require('acorn-class-fields');
const staticClassFeatures = require('acorn-static-class-features');

const localizationDir = path.resolve(__dirname, '../src/extension/legacy/features/l10n');
const featuresProjectDir = path.join('src', 'extension', 'features');

const parser = acorn.Parser.extend(jsx(), classFields, staticClassFeatures);

function getLocalizations(callback) {
  const toolkitStrings = {};
  const otherStrings = {};

  glob(`${featuresProjectDir}/*/**/*.{js,jsx}`, (_, files) => {
    files.forEach(fileName => {
      const content = fs.readFileSync(fileName);
      const parsed = parser.parse(content, {
        sourceType: 'module',
        ecmaVersion: '2020',
      });

      function handleNode(node) {
        if (node.type === 'CallExpression' && node.callee.name === 'l10n') {
          const [localizationKeyNode, defaultStringNode] = node.arguments;
          const errors = [];

          if (!localizationKeyNode || localizationKeyNode.type !== 'Literal') {
            errors.push('The first argument to l10n should be a string literal.');
          }

          if (!defaultStringNode || defaultStringNode.type !== 'Literal') {
            errors.push('The second argument in a call to l10n must be a string literal.');
          }

          if (errors.length) {
            console.error(
              `Localization Errors in ${fileName}\n${errors.map(error => `\t${error}`)}\n`
            );
          } else {
            const localizationKeyValue = localizationKeyNode.value;
            const defaultStringValue = defaultStringNode.value;

            if (localizationKeyValue.startsWith('toolkit.')) {
              toolkitStrings[localizationKeyNode.value] = defaultStringValue;
            } else {
              otherStrings[localizationKeyValue] = defaultStringValue;
            }
          }
        }
      }

      function walkFull(root, handler) {
        const visited = [];
        visit(root);

        function visit(node) {
          if (visited.indexOf(node) !== -1) {
            return;
          }

          visited.push(node);
          handler(node);

          for (let key in node) {
            if (Object.prototype.hasOwnProperty.call(node, key)) {
              const value = node[key];
              if (value instanceof acorn.Node) {
                visit(value);
              } else if (Array.isArray(value)) {
                value.forEach(nested => {
                  if (nested instanceof acorn.Node) {
                    visit(nested);
                  }
                });
              }
            }
          }
        }
      }

      walkFull(parsed, handleNode);
    });

    callback(toolkitStrings, otherStrings);
  });
}

getLocalizations((toolkitStrings, otherStrings) => {
  const sortedToolkitStrings = Object.entries(toolkitStrings)
    .sort((a, b) => {
      if (a[0] < b[0]) {
        return -1;
      }
      if (a[0] > b[0]) {
        return 1;
      }

      return 0;
    })
    .reduce((reduced, [key, value]) => {
      return {
        ...reduced,
        [key]: value,
      };
    }, {});

  let ynabStrings;
  try {
    ynabStrings = JSON.parse(fs.readFileSync(`${localizationDir}/ynab.json`, { format: 'utf8' }));
  } catch {
    console.error('Failed to parse ynab.json');
  }

  const allStrings = {
    ...ynabStrings,
    ...sortedToolkitStrings,
  };

  for (const key in otherStrings) {
    if (Object.prototype.hasOwnProperty.call(otherStrings, key) && !allStrings[key]) {
      console.error(`No localization key for ${key}. Use a new key with the "toolkit." prefix.`);
    }
  }

  const allStringsJSON = JSON.stringify(allStrings, null, 2);
  fs.writeFileSync(`${localizationDir}/en.json`, `${allStringsJSON}\n`);
  fs.writeFileSync(
    `${localizationDir}/default.js`,
    `/* eslint-disable */\n// prettier-ignore\nynabToolKit.l10nData = ${allStringsJSON}\n`
  );

  if (process.argv[2]) {
    console.log('Crowdin API Key detected, uploading en.json...');
    exec(
      `curl -F "files[en.json]=@${localizationDir}/en.json" https://api.crowdin.com/api/project/toolkit-for-ynab/update-file?key=${
        process.argv[2]
      }`
    );
  } else {
    console.log('No Crowdin API Key, skipping upload.');
  }
});
