interface StorageOptions {
  storage?: any;
}

export function setupWithWebExtensionStorage<Suite, Options>(
  setupFn: (opts: Options) => Suite
): (opts?: Options & StorageOptions) => Suite {
  return (options) => {
    const mockStorage = options?.storage || {};
    (chrome.storage as any).mock.setStorageData(mockStorage);
    return setupFn(options);
  };
}

interface LocalStorageOptions {
  localStorage?: Record<string, any>;
}

export function setupWithLocalStorage<Suite, Options>(
  setupFn: (opts: Options) => Suite
): (opts?: Options & LocalStorageOptions) => Suite {
  return (options) => {
    const mockLocalStorage = options?.localStorage || {};

    Object.entries(mockLocalStorage).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    return setupFn(options);
  };
}
