export * from './settings';
import { allToolkitSettings, settingMigrationMap } from './settings';
import { ToolkitStorage } from 'toolkit/core/common/storage';

const storage = new ToolkitStorage();

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
        const settingIsPersisted = storedFeatureSettings.includes(setting.name);

        if (settingIsPersisted) {
          return storage
            .getFeatureSetting(setting.name)
            .then(persistedValue => ensureSettingIsValid(setting.name, persistedValue));
        }

        const migrationSetting = settingMigrationMap[setting.name];
        if (migrationSetting && storedFeatureSettings.includes(migrationSetting.oldSettingName)) {
          const { oldSettingName, settingMapping } = migrationSetting;
          return storage.getFeatureSetting(oldSettingName).then(oldPersistedValue => {
            let newSetting = oldPersistedValue;
            if (settingMapping) {
              newSetting = settingMapping[oldPersistedValue];
            }

            return storage
              .setFeatureSetting(setting.name, newSetting)
              .then(() => ensureSettingIsValid(setting.name, newSetting));
          });
        }

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
