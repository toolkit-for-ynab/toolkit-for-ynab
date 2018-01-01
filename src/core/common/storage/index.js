import { getBrowser } from 'toolkit/core/common/web-extensions';

const FEATURE_SETTING_PREFIX = 'toolkit-feature:';

export const featureSettingKey = (featureName) => `${FEATURE_SETTING_PREFIX}${featureName}`;

export class ToolkitStorage {
  _storageArea = 'local';
  _storageListeners = new Map();

  constructor() {
    getBrowser().storage.onChanged.addListener(this._listenForChanges);
  }

  // many features have been built with the assumption that settings come back
  // as strings and it's just easier to maintain that assumption rather than update
  // those features. so override options with parse: false when getting feature settings
  getFeatureSetting(settingName, options = {}) {
    const getFeatureSettingOptions = {
      parse: false,
      ...options
    };

    return this.getStorageItem(featureSettingKey(settingName), getFeatureSettingOptions);
  }

  getFeatureSettings(settingNames, options = {}) {
    const getFeatureSettingOptions = {
      parse: false,
      ...options
    };

    return Promise.all(settingNames.map((settingName) => {
      return this.getStorageItem(featureSettingKey(settingName), getFeatureSettingOptions);
    }));
  }

  setFeatureSetting(settingName, value, options = {}) {
    return this.setStorageItem(featureSettingKey(settingName), value, options);
  }

  getStorageItem(itemKey, options = {}) {
    return this._get(itemKey, options).then((value) => {
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
    return this._get(null, options).then((allStorage) => {
      const storedSettings = [];
      for (const [key] of Object.entries(allStorage)) {
        if (key.startsWith(FEATURE_SETTING_PREFIX)) {
          storedSettings.push(key.replace(FEATURE_SETTING_PREFIX, ''));
        }
      }

      return storedSettings;
    });
  }

  on(storageKey, callback) {
    if (this._storageListeners.has(storageKey)) {
      const listeners = this._storageListeners.get(storageKey);
      this._storageListeners.set(storageKey, [...listeners, callback]);
    } else {
      this._storageListeners.set(storageKey, [callback]);
    }
  }

  onFeatureSettingChanged(settingName, callback) {
    this.on(featureSettingKey(settingName), callback);
  }

  off(storageKey, callback) {
    if (this._storageListeners.has(storageKey)) {
      const listeners = this._storageListeners.get(storageKey);
      this._storageListeners.set(storageKey, listeners.filter((listener) => listener !== callback));
    }
  }

  offFeatureSettingChanged(settingName, callback) {
    this.off(featureSettingKey(settingName), callback);
  }

  _listenForChanges = (changes, areaName) => {
    if (areaName !== this._storageArea) return;

    for (const [key, value] of Object.entries(changes)) {
      if (this._storageListeners.has(key)) {
        const listeners = this._storageListeners.get(key);
        listeners.forEach((listener) => { listener(value.newValue); });
      }
    }
  }

  _get(key, options) {
    const getOptions = {
      parse: true,
      storageArea: this._storageArea,
      ...options
    };

    return new Promise((resolve, reject) => {
      try {
        getBrowser().storage[getOptions.storageArea].get(key, (data) => {
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
        getBrowser().storage[storageArea].remove(key, resolve);
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
        getBrowser().storage[storageArea].set(update, resolve);
      } catch (e) {
        reject(e);
      }
    });
  }
}
