const STORAGE_KEY_PREFIX = 'ynab-toolkit-';

export function getToolkitStorageKey(key, defaultValue) {
  const value = localStorage.getItem(STORAGE_KEY_PREFIX + key);

  try {
    return JSON.parse(value) || defaultValue;
  } catch (e) {
    return value || defaultValue;
  }
}

export function setToolkitStorageKey(key, value) {
  return localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
}

export function removeToolkitStorageKey(key) {
  return localStorage.removeItem(STORAGE_KEY_PREFIX + key);
}

export function i10n(key, defaultValue) {
  return ynabToolKit.l10nData && ynabToolKit.l10nData[key] || defaultValue;
}
