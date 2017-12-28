export * from './settings';
import { allToolkitSettings } from './settings';
import { ToolkitStorage } from 'toolkit/core/storage';

const storage = new ToolkitStorage();

function getLegacyStorageKeys() {
  return new Promise(function (resolve, reject) {
    try {
      resolve(Object.keys(localStorage));
    } catch (e) {
      reject(e);
    }
  });
}

function persistLegacySetting(setting) {
  const data = localStorage.getItem(setting);
  return storage.setFeatureSetting(setting, data);
}

export function ensureDefaultsAreSet() {
  return new Promise(function (resolve) {
    Promise.all([
      getLegacyStorageKeys(),
      storage.getStoredFeatureSettings()
    ]).then(([legacyStorageKeys, storedFeatureSettings]) => {
      const promises = [];

      allToolkitSettings.forEach(function (setting) {
        if (!storedFeatureSettings.includes(setting.name)) {
          if (legacyStorageKeys.includes(setting.name)) {
            return promises.push(persistLegacySetting(setting.name));
          }

          promises.push(storage.setFeatureSetting(setting.name, setting.default));
        }
      });

      Promise.all(promises).then(function () {
        resolve();
      });
    });
  });
}
