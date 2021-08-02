import { allToolkitSettings } from 'toolkit/core/settings';

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
  { name: 'General', settings: generalSettings },
  { name: 'Account', settings: accountSettings },
  { name: 'Budget', settings: budgetSettings },
  { name: 'Reports', settings: reportsSettings },
  { name: 'Toolkit Reports', settings: toolkitReportSettings },
  { name: 'Advanced', settings: advancedSettings },
];
