import { allToolkitSettings } from 'toolkit/core/settings';
import type { FeatureSettingConfig } from 'toolkit/types/toolkit/features';

interface SettingsSection {
  settings: FeatureSettingConfig[];
  name: string;
}

const generalSettings: FeatureSettingConfig[] = [];
const accountSettings: FeatureSettingConfig[] = [];
const budgetSettings: FeatureSettingConfig[] = [];
const reportsSettings: FeatureSettingConfig[] = [];
const toolkitReportSettings: FeatureSettingConfig[] = [];
const advancedSettings: FeatureSettingConfig[] = [];

for (const setting of allToolkitSettings) {
  switch (setting.section) {
    case 'general':
      generalSettings.push(setting);
      break;
    case 'accounts':
      accountSettings.push(setting);
      break;
    case 'budget':
      budgetSettings.push(setting);
      break;
    case 'reports':
      reportsSettings.push(setting);
      break;
    case 'toolkitReports':
      toolkitReportSettings.push(setting);
      break;
    case 'advanced':
      advancedSettings.push(setting);
      break;
  }
}

export const settingsBySection = [
  { name: 'General', settings: generalSettings.sort((a, b) => a.title.localeCompare(b.title)) },
  { name: 'Account', settings: accountSettings.sort((a, b) => a.title.localeCompare(b.title)) },
  { name: 'Budget', settings: budgetSettings.sort((a, b) => a.title.localeCompare(b.title)) },
  { name: 'Reports', settings: reportsSettings.sort((a, b) => a.title.localeCompare(b.title)) },
  {
    name: 'Toolkit Reports',
    settings: toolkitReportSettings.sort((a, b) => a.title.localeCompare(b.title)),
  },
  { name: 'Advanced', settings: advancedSettings.sort((a, b) => a.title.localeCompare(b.title)) },
];
