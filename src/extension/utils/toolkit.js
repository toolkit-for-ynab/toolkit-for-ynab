const STORAGE_KEY_PREFIX = 'ynab-toolkit-';

export function getToolkitStorageKey(key, type) {
  let value = localStorage.getItem(STORAGE_KEY_PREFIX + key);

  switch (type) {
    case 'boolean': return value === 'true';
    case 'number': return Number(value);
    default: return value;
  }
}

export function setToolkitStorageKey(key, value) {
  return localStorage.setItem(STORAGE_KEY_PREFIX + key, value);
}

export function removeToolkitStorageKey(key) {
  return localStorage.removeItem(STORAGE_KEY_PREFIX + key);
}

export function i10n(key, defaultValue) {
  return ynabToolKit.l10nData && ynabToolKit.l10nData[key] || defaultValue;
}
