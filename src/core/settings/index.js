export * from './settings';
import { allToolkitSettings, legacySettingMap } from './settings';
import { ToolkitStorage } from 'toolkit/core/common/storage';

const storage = new ToolkitStorage();

function updateLegacySetting(legacySetting, newSetting) {
  return storage.getFeatureSetting(legacySetting).then(legacyValue => {
    return storage.setFeatureSetting(newSetting, legacyValue);
  });
}

function ensureSettingIsValid(name, value) {
  let validValue = value;
  if (value === 'true' || value === 'false') {
    validValue = JSON.parse(value);
    return storage.setFeatureSetting(name, JSON.parse(value));
  }

  return validValue;
}

export function getUserSettings() {
  return new Promise(function(resolve) {
    storage.getStoredFeatureSettings().then(storedFeatureSettings => {
      const settingPromises = allToolkitSettings.map(setting => {
        const legacySettingName = legacySettingMap[setting.name];
        const settingIsPersisted = storedFeatureSettings.includes(setting.name);
        const legacySettingPersisted = storedFeatureSettings.includes(legacySettingName);

        // this should be the case for all users once they've loaded the toolkit post web-extensions
        if (settingIsPersisted) {
          return storage
            .getFeatureSetting(setting.name)
            .then(persistedValue => ensureSettingIsValid(setting.name, persistedValue));

          // this will be the case for any feature that has been migrated post web-extensions
        } else if (legacySettingPersisted) {
          return updateLegacySetting(legacySettingName, setting.name)
            .then(() => storage.getFeatureSetting(setting.name))
            .then(persistedValue => ensureSettingIsValid(setting.name, persistedValue));
        }

        // if we've not already returned then this is an entirely new feature
        return storage
          .setFeatureSetting(setting.name, setting.default)
          .then(() => storage.getFeatureSetting(setting.name));
      });

      Promise.all(settingPromises).then(persistedSettings => {
        const userSettings = allToolkitSettings.reduce((allSettings, currentSetting, index) => {
          allSettings[currentSetting.name] = persistedSettings[index];
          return allSettings;
        }, {});

        resolve(userSettings);
      });
    });
  });
}
