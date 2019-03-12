const fs = require('fs');
const path = require('path');

const allToolkitSettings = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf8')
);
const outputFile = path.join(__dirname, '../docs/feature-list.md');

const settingsMap = allToolkitSettings.reduce((map, setting) => {
  if (map.has(setting.section)) {
    const sectionSettings = map.get(setting.section);
    sectionSettings.push(setting);
    sectionSettings.sort((a, b) => {
      if (a.title > b.title) {
        return 1;
      }

      return -1;
    });
  } else {
    map.set(setting.section, [setting]);
  }

  return map;
}, new Map());

const docSettingsOrder = [
  { key: 'general', name: 'General' },
  { key: 'budget', name: 'Budget' },
  { key: 'accounts', name: 'Accounts' },
  { key: 'reports', name: 'Reports' },
  { key: 'advanced', name: 'Advanced' },
];

let docOutput =
  '<!-- THIS FILE IS GENERATED THERE IS NO NEED TO ADD YOUR FEATURE TO THIS LIST -->\n# List of YNAB Toolkit Features\n\n';
docOutput += docSettingsOrder
  .map(({ key, name }) => {
    let settingSection = `<details><summary>${name} (Click to Expand/Collapse)</summary>\n`;

    const sectionSettings = settingsMap.get(key);
    settingSection += sectionSettings
      .map(({ description, title }) => {
        return `\n## ${title}\n${description}`;
      })
      .join('\n');

    return `${settingSection}</details>`;
  })
  .join('\n');

fs.writeFile(outputFile, docOutput, error => {
  if (error) process.exit(1);
});
