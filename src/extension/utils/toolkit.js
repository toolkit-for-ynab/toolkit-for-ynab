const STORAGE_KEY_PREFIX = 'ynab-toolkit-';

export function getToolkitStorageKey(key, defaultValue) {
  let serializedValue = localStorage.getItem(STORAGE_KEY_PREFIX + key);

  if (serializedValue === null || serializedValue === 'undefined') {
    return defaultValue;
  }

  try {
    return JSON.parse(serializedValue);
  } catch (e) {
    return defaultValue;
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
