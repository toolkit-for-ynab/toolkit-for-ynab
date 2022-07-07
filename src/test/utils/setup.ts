interface StorageOptions {
  storage?: any;
}

export function setupWithWebExtensionStorage<Suite, SuiteOptions>(
  setupFn: (opts?: SuiteOptions) => Suite
): (opts?: SuiteOptions & StorageOptions) => Suite {
  return (options) => {
    const mockStorage = options?.storage || {};
    (chrome.storage as any).mock.setStorageData(mockStorage);
    return setupFn(options);
  };
}

interface LocalStorageOptions {
  localStorage?: Record<string, any>;
}

export function setupWithLocalStorage<Suite, SuiteOptions>(
  setupFn: (opts?: SuiteOptions) => Suite
): (opts?: SuiteOptions & LocalStorageOptions) => Suite {
  return (options) => {
    const mockLocalStorage = options?.localStorage || {};

    Object.entries(mockLocalStorage).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    return setupFn(options);
  };
}
