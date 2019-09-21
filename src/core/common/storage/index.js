import { getBrowser } from 'toolkit/core/common/web-extensions';

const FEATURE_SETTING_PREFIX = 'toolkit-feature:';

export const featureSettingKey = featureName => `${FEATURE_SETTING_PREFIX}${featureName}`;

export const StorageArea = {
  Local: 'local',
};

export class ToolkitStorage {
  _browser = getBrowser();

  _storageArea = 'local';

  _storageListeners = new Map();

  constructor(storageArea) {
    if (storageArea) {
      this._storageArea = storageArea;
    }

    this._browser.storage.onChanged.addListener(this._listenForChanges);
  }

  // many features have been built with the assumption that settings come back
  // as strings and it's just easier to maintain that assumption rather than update
  // those features. so override options with parse: false when getting feature settings
  getFeatureSetting(settingName, options = {}) {
    const getFeatureSettingOptions = {
      parse: false,
      ...options,
    };

    return this.getStorageItem(featureSettingKey(settingName), getFeatureSettingOptions);
  }

  getFeatureSettings(settingNames, options = {}) {
    const getFeatureSettingsOptions = {
      parse: false,
      ...options,
    };

    return Promise.all(
      settingNames.map(settingName => {
        return this.getStorageItem(featureSettingKey(settingName), getFeatureSettingsOptions);
      })
    );
  }

  setFeatureSetting(settingName, value, options = {}) {
    return this.setStorageItem(featureSettingKey(settingName), value, options);
  }

  removeFeatureSetting(settingName, options = {}) {
    return this.removeStorageItem(featureSettingKey(settingName), options);
  }

  getStorageItem(itemKey, options = {}) {
    return this._get(itemKey, options).then(value => {
      if (typeof value === 'undefined' && typeof options.default !== 'undefined') {
        return options.default;
      }

      return value;
    });
  }

  removeStorageItem(itemKey, options = {}) {
    return this._remove(itemKey, options);
  }

  setStorageItem(itemKey, itemData, options = {}) {
    return this._set(itemKey, itemData, options);
  }

  getStoredFeatureSettings(options = {}) {
    return this._get(null, options).then(allStorage => {
      const storedSettings = [];
      for (const [key] of Object.entries(allStorage)) {
        if (key.startsWith(FEATURE_SETTING_PREFIX)) {
          storedSettings.push(key.replace(FEATURE_SETTING_PREFIX, ''));
        }
      }

      return storedSettings;
    });
  }

  onStorageItemChanged(storageKey, callback) {
    if (this._storageListeners.has(storageKey)) {
      const listeners = this._storageListeners.get(storageKey);
      this._storageListeners.set(storageKey, [...listeners, callback]);
    } else {
      this._storageListeners.set(storageKey, [callback]);
    }
  }

  offStorageItemChanged(storageKey, callback) {
    if (this._storageListeners.has(storageKey)) {
      const listeners = this._storageListeners.get(storageKey);
      this._storageListeners.set(storageKey, listeners.filter(listener => listener !== callback));
    }
  }

  onFeatureSettingChanged(settingName, callback) {
    this.onStorageItemChanged(featureSettingKey(settingName), callback);
  }

  offFeatureSettingChanged(settingName, callback) {
    this.offStorageItemChanged(featureSettingKey(settingName), callback);
  }

  _listenForChanges = (changes, areaName) => {
    if (areaName !== this._storageArea) return;

    for (const [key, value] of Object.entries(changes)) {
      if (this._storageListeners.has(key)) {
        const listeners = this._storageListeners.get(key);
        listeners.forEach(listener => {
          listener(value.newValue);
        });
      }
    }
  };

  _get(key, options) {
    const getOptions = {
      parse: true,
      storageArea: this._storageArea,
      ...options,
    };

    return new Promise((resolve, reject) => {
      try {
        this._browser.storage[getOptions.storageArea].get(key, data => {
          // if we're fetching everything -- don't try parsing it
          if (key === null) {
            return resolve(data);
          }

          try {
            if (getOptions.parse) {
              resolve(JSON.parse(data[key]));
            } else {
              resolve(data[key]);
            }
          } catch (_ignore) {
            resolve(data[key]);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  _remove(key, options) {
    const storageArea = options.storageArea || this._storageArea;

    return new Promise((resolve, reject) => {
      try {
        this._browser.storage[storageArea].remove(key, resolve);
      } catch (e) {
        reject(e);
      }
    });
  }

  _set(key, value, options) {
    const storageArea = options.storageArea || this._storageArea;

    return new Promise((resolve, reject) => {
      try {
        const update = { [key]: value };
        this._browser.storage[storageArea].set(update, resolve);
      } catch (e) {
        reject(e);
      }
    });
  }
}
