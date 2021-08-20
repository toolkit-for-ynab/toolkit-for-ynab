interface FeatureSettingBaseConfig {
  name: FeatureName;
  section: 'general' | 'accounts' | 'budget' | 'reports' | 'advanced' | 'toolkitReports' | 'system';
  title: string;
  description: string;
  default: FeatureSetting;
  hidden?: boolean;
}

interface FeatureSettingSelectOption {
  name: string;
  value: string;
}

interface FeatureSettingSelectConfig extends FeatureSettingBaseConfig {
  type: 'select';
  options: FeatureSettingSelectOption[];
}

interface FeatureSettingToggleConfig extends FeatureSettingBaseConfig {
  type: 'checkbox';
}

interface FeatureSettingColorConfig extends FeatureSettingBaseConfig {
  type: 'color';
}

interface FeatureSettingSystemConfig extends FeatureSettingBaseConfig {
  type: 'system';
}

type FeatureSettingConfig =
  | FeatureSettingToggleConfig
  | FeatureSettingSelectConfig
  | FeatureSettingColorConfig
  | FeatureSettingSystemConfig;
