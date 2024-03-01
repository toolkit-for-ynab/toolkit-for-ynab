import { getBrowser } from 'toolkit/core/common/web-extensions';
import type { FeatureSetting } from 'toolkit/types/toolkit/features';

export const FEATURE_SETTING_PREFIX = 'toolkit-feature:';

export const featureSettingKey = (featureName: FeatureName) =>
  `${FEATURE_SETTING_PREFIX}${featureName}`;

export enum StorageArea {
  Local = 'local',
}

interface GetOptions {
  parse: boolean;
  storageArea: StorageArea;
}

interface SetOptions {
  storageArea: StorageArea;
}

interface RemoveOptions {
  storageArea: StorageArea;
}

type StorageListener = (key: string, newValue: any) => void;

export class ToolkitStorage {
  private browser = getBrowser();
  private storageArea: StorageArea = StorageArea.Local;
  private storageListeners = new Map<string, StorageListener[]>();

  constructor(storageArea: StorageArea = StorageArea.Local) {
    if (storageArea) {
      this.storageArea = storageArea;
    }

    this.browser.storage.onChanged.addListener(this._listenForChanges);
  }

  // many features have been built with the assumption that settings come back
  // as strings and it's just easier to maintain that assumption rather than update
  // those features. so override options with parse: false when getting feature settings
  getFeatureSetting(settingName: FeatureName, options: Partial<GetOptions> = {}) {
    const getFeatureSettingOptions: Partial<GetOptions> = {
      parse: false,
      ...options,
    };

    return this.getStorageItem(featureSettingKey(settingName), getFeatureSettingOptions);
  }

  getFeatureSettings(settingNames: FeatureName[], options: Partial<GetOptions> = {}) {
    const getFeatureSettingsOptions = {
      parse: false,
      ...options,
    };

    return Promise.all(
      settingNames.map((settingName) => {
        return this.getStorageItem(featureSettingKey(settingName), getFeatureSettingsOptions);
      })
    );
  }

  setFeatureSetting(
    settingName: FeatureName,
    value: FeatureSetting,
    options: Partial<SetOptions> = {}
  ) {
    return this.setStorageItem(featureSettingKey(settingName), value, options);
  }

  removeFeatureSetting(settingName: FeatureName, options: Partial<RemoveOptions> = {}) {
    return this.removeStorageItem(featureSettingKey(settingName), options);
  }

  getStorageItem(itemKey: string | null, options: Partial<GetOptions> & { default?: string } = {}) {
    return this._get(itemKey, options).then((value) => {
      if (typeof value === 'undefined' && typeof options.default !== 'undefined') {
        return options.default;
      }

      return value;
    });
  }

  removeStorageItem(itemKey: string, options = {}) {
    return this._remove(itemKey, options);
  }

  setStorageItem(itemKey: string, itemData: any, options = {}) {
    return this._set(itemKey, itemData, options);
  }

  getStoredFeatureSettings(options = {}) {
    return this._get(null, options).then((allStorage) => {
      const storedSettings: FeatureName[] = [];
      for (const [key] of Object.entries(allStorage)) {
        if (key.startsWith(FEATURE_SETTING_PREFIX)) {
          storedSettings.push(key.replace(FEATURE_SETTING_PREFIX, '') as FeatureName);
        }
      }

      return storedSettings;
    });
  }

  onStorageItemChanged(storageKey: string, callback: StorageListener) {
    if (this.storageListeners.has(storageKey)) {
      const listeners = this.storageListeners.get(storageKey);
      this.storageListeners.set(storageKey, [...listeners!, callback]);
    } else {
      this.storageListeners.set(storageKey, [callback]);
    }
  }

  offStorageItemChanged(storageKey: string, callback: StorageListener) {
    if (this.storageListeners.has(storageKey)) {
      const listeners = this.storageListeners.get(storageKey);
      this.storageListeners.set(
        storageKey,
        listeners!.filter((listener) => listener !== callback)
      );
    }
  }

  onFeatureSettingChanged(settingName: FeatureName, callback: StorageListener) {
    this.onStorageItemChanged(featureSettingKey(settingName), callback);
  }

  offFeatureSettingChanged(settingName: FeatureName, callback: StorageListener) {
    this.offStorageItemChanged(featureSettingKey(settingName), callback);
  }

  onToolkitDisabledChanged(callback: StorageListener) {
    this.onStorageItemChanged(featureSettingKey('DisableToolkit'), callback);
  }

  offToolkitDisabledChanged(callback: StorageListener) {
    this.offStorageItemChanged(featureSettingKey('DisableToolkit'), callback);
  }

  _listenForChanges = (changes: { [key: string]: any }, areaName: StorageArea) => {
    if (areaName !== this.storageArea) return;

    for (const [key, value] of Object.entries(changes)) {
      if (this.storageListeners.has(key)) {
        const listeners = this.storageListeners.get(key);
        listeners!.forEach((listener) => {
          listener(key, value.newValue);
        });
      }
    }
  };

  _get(key: string | null, options: Partial<GetOptions>): Promise<any> {
    const getOptions: GetOptions = {
      parse: true,
      storageArea: this.storageArea,
      ...options,
    };

    return new Promise((resolve, reject) => {
      try {
        this.browser.storage[getOptions.storageArea].get(key, (data: any) => {
          // if we're fetching everything -- don't try parsing it
          if (key === null) {
            return resolve(data);
          }

          try {
            if (getOptions.parse) {
              return resolve(JSON.parse(data[key]));
            } else {
              return resolve(data[key]);
            }
          } catch (_ignore) {
            return resolve(data[key]);
          }
        });
      } catch (e) {
        return reject(e);
      }
    });
  }

  _remove(key: string, options: Partial<RemoveOptions>): Promise<void> {
    const storageArea = options.storageArea || this.storageArea;

    return new Promise((resolve, reject) => {
      try {
        this.browser.storage[storageArea].remove(key, resolve);
      } catch (e) {
        reject(e);
      }
    });
  }

  _set(key: string, value: any, options: Partial<SetOptions>) {
    const storageArea = options.storageArea || this.storageArea;

    return new Promise((resolve, reject) => {
      try {
        const update = { [key]: value };
        this.browser.storage[storageArea].set(update, resolve);
      } catch (e) {
        reject(e);
      }
    });
  }
}

export const localToolkitStorage = new ToolkitStorage(StorageArea.Local);
