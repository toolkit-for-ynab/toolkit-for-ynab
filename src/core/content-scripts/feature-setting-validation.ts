import type { FeatureSetting, FeatureSettingConfig } from 'toolkit/types/toolkit/features';

const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

export function createFeatureSettingValidator(allSettings: FeatureSettingConfig[]) {
  const settingMap = new Map<FeatureName, FeatureSettingConfig>();
  for (const setting of allSettings) {
    settingMap.set(setting.name, setting);
  }

  return function validateFeatureSettingValue(
    name: FeatureName,
    value: FeatureSetting | string | boolean,
  ): FeatureSetting | null {
    const setting = settingMap.get(name);
    if (!setting) {
      return null;
    }

    const normalizedValue = normalizeIncomingValue(value);

    if (!isValidForSetting(setting, normalizedValue)) {
      return null;
    }

    return normalizedValue;
  };
}

function normalizeIncomingValue(value: FeatureSetting | string | boolean): FeatureSetting {
  if (value === 'true' || value === 'false') {
    return value === 'true';
  }

  return value as FeatureSetting;
}

function isValidForSetting(setting: FeatureSettingConfig, value: FeatureSetting) {
  switch (setting.type) {
    case 'checkbox':
      return typeof value === 'boolean';
    case 'select':
      if (value === false) {
        return true;
      }

      return (
        typeof value === 'string' &&
        Boolean(setting.options?.some((option) => option.value === value))
      );
    case 'color':
      return typeof value === 'string' && HEX_COLOR_REGEX.test(value);
    default:
      return typeof value === 'string' || typeof value === 'boolean';
  }
}

export { normalizeIncomingValue, isValidForSetting };
