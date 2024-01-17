#!/usr/bin/env ts-node

import fs from 'fs';

import allToolkitSettings from './settings.json';
import { FEATURE_LIST_MD } from './lib/paths';

type Setting = typeof allToolkitSettings[number];

const settingsMap = allToolkitSettings.reduce((map, setting) => {
  const sectionSettings = map.get(setting.section);
  if (sectionSettings) {
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
}, new Map<string, Setting[]>());

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
    if (!sectionSettings) {
      throw new Error(`Key '${key}' missing in 'settings.json', expected from 'docSettingsOrder'.`);
    }

    settingSection += sectionSettings
      .map(({ description, title }) => {
        return `\n## ${title}\n${description}`;
      })
      .join('\n');

    return `${settingSection}</details>`;
  })
  .join('\n');

fs.writeFile(FEATURE_LIST_MD, docOutput, (error) => {
  if (error) process.exit(1);
});
