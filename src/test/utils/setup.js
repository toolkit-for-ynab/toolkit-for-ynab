export const setupWithWebExtensionStorage = setupFn => {
  return (options = {}) => {
    const mockStorage = options.storage || {};

    chrome.storage.mock.setStorageData(mockStorage);

    return setupFn(options);
  };
};

export const setupWithLocalStorage = setupFn => {
  return (options = {}) => {
    const mockLocalStorage = options.localStorage || {};

    Object.entries(mockLocalStorage).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    return setupFn(options);
  };
};
