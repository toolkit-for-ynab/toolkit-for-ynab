export * from './settings';
import { getBrowser } from 'toolkit/core/common/web-extensions';
import { allToolkitSettings, legacySettingMap } from './settings';
import { ToolkitStorage } from 'toolkit/core/common/storage';

const storage = new ToolkitStorage();

function getKangoKeys() {
  return new Promise((resolve) => {
    getBrowser().runtime.sendMessage({ type: 'storage', content: { type: 'keys' } }, (response) => {
      resolve(response);
    });
  });
}

function persistKangoStorageSetting(setting, persistAs) {
  const settingName = persistAs || setting;

  return new Promise((resolve) => {
    getBrowser().runtime.sendMessage({ type: 'storage', content: { type: 'get', itemName: setting } }, (response) => {
      storage.setFeatureSetting(settingName, response).then(resolve);
    });
  });
}

function updateLegacySetting(legacySetting, newSetting) {
  return storage.getFeatureSetting(legacySetting).then((legacyValue) => {
    return storage.setFeatureSetting(newSetting, legacyValue);
  });
}

export function getUserSettings() {
  return new Promise(function (resolve) {
    Promise.all([
      getKangoKeys(),
      storage.getStoredFeatureSettings()
    ]).then(([kangoKeys, storedFeatureSettings]) => {
      const settingPromises = allToolkitSettings.map((setting) => {
        const legacySettingName = legacySettingMap[setting.name];
        const settingIsPersisted = storedFeatureSettings.includes(setting.name);
        const leagcySettingPersisted = storedFeatureSettings.includes(legacySettingName);

        if (settingIsPersisted) {
          // this should be the case for all users once they've loaded the toolkit post web-extensions
          return storage.getFeatureSetting(setting.name);
        } else if (leagcySettingPersisted) {
          // this will be the case for any feature that has been migrated post web-extensions
          return updateLegacySetting(legacySettingName, setting.name)
            .then(storage.getFeatureSetting(setting.name));
        }

        // if we've not already returned then this is either the first-load of the extension post
        // web-extensions or this is an entirely new feature. check the former case first and then
        // assume the latter.

        // kango stored settings in localStorage of the background page so look there first
        const isInKangoStorage = kangoKeys.includes(setting.name);
        const isLegacySettingInKangoStorage = kangoKeys.includes(legacySettingName);

        if (isInKangoStorage) {
          // we have the setting so go ahead and persist it to storage and carry on
          return persistKangoStorageSetting(setting.name)
            .then(storage.getFeatureSetting(setting.name));
        } else if (isLegacySettingInKangoStorage) {
          // this is a migration feature -- need to persist the new setting name
          return persistKangoStorageSetting(legacySettingName, setting.name)
            .then(storage.getFeatureSetting(setting.name));
        }

        // if we're still here then all we have left is a new feature. persist the default.
        return storage.setFeatureSetting(setting.name, setting.default)
          .then(storage.getFeatureSetting(setting.name));
      });

      Promise.all(settingPromises).then((persistedSettings) => {
        const userSettings = allToolkitSettings.reduce((allSettings, currentSetting, index) => {
          allSettings[currentSetting.name] = persistedSettings[index];
          return allSettings;
        }, {});

        resolve(userSettings);
      });
    });
  });
}
