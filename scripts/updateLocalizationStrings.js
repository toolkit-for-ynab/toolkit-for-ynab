const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

const localizationDir = path.resolve(__dirname, '../src/extension/legacy/features/l10n');

let ynab;
try {
  ynab = JSON.parse(fs.readFileSync(`${localizationDir}/ynab.json`, { format: 'utf8' }));
} catch {
  console.error('Failed to parse ynab.json');
  process.exit(1);
}

let toolkit;
try {
  toolkit = JSON.parse(fs.readFileSync(`${localizationDir}/toolkit.json`, { format: 'utf8' }));
} catch {
  console.error('Failed to parse toolkit.json');
  process.exit(1);
}

console.log('Merging localization files into en.json');

fs.writeFileSync(
  `${localizationDir}/en.json`,
  `${JSON.stringify(
    {
      ...ynab,
      ...toolkit,
    },
    null,
    2
  )}
`
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
