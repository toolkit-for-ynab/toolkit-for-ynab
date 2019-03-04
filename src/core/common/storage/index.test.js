import { ToolkitStorage } from './index';
import { getBrowser } from 'toolkit/core/common/web-extensions';
import { setupWithWebExtensionStorage } from 'toolkit/test/utils/setup';

const setup = setupWithWebExtensionStorage((overrides = {}) => {
  const options = {
    storageArea: 'local',
    ...overrides,
  };

  const storage = new ToolkitStorage(options.storageArea);

  return {
    browser: getBrowser(),
    storage,
  };
});

describe('ToolkitStorage', () => {
  describe('constructor', () => {
    it("should attach to the storage's onChanged event", () => {
      const { browser } = setup();
      expect(browser.storage.onChanged.addListener).toHaveBeenCalled();
    });
  });

  describe('getFeatureSetting', () => {
    it('should call getStorageItem with a feature-namespaced key', () => {
      const { storage } = setup();
      const getStorageItemSpy = jest.spyOn(storage, 'getStorageItem');
      storage.getFeatureSetting('testSetting');
      expect(getStorageItemSpy).toHaveBeenCalledWith('toolkit-feature:testSetting', {
        parse: false,
      });
    });

    it('should should allow overrides of options', () => {
      const { storage } = setup();
      const getStorageItemSpy = jest.spyOn(storage, 'getStorageItem');
      storage.getFeatureSetting('testSetting', { parse: true, test: 'thing' });
      expect(getStorageItemSpy).toHaveBeenCalledWith('toolkit-feature:testSetting', {
        parse: true,
        test: 'thing',
      });
    });
  });

  describe('getFeatureSettings', () => {
    it('should call getStorageItem with feature-namespaced keys', () => {
      const { storage } = setup();
      const getStorageItemSpy = jest.spyOn(storage, 'getStorageItem');
      storage.getFeatureSettings(['test', 'setting']);
      expect(getStorageItemSpy).toHaveBeenCalledTimes(2);
      expect(getStorageItemSpy).toHaveBeenCalledWith('toolkit-feature:test', {
        parse: false,
      });
      expect(getStorageItemSpy).toHaveBeenCalledWith('toolkit-feature:setting', { parse: false });
    });

    it('should allow overrides of options', () => {
      const { storage } = setup();
      const getStorageItemSpy = jest.spyOn(storage, 'getStorageItem');
      storage.getFeatureSettings(['test', 'setting'], {
        parse: true,
        test: 'thing',
      });
      expect(getStorageItemSpy).toHaveBeenCalledTimes(2);
      expect(getStorageItemSpy).toHaveBeenCalledWith('toolkit-feature:test', {
        parse: true,
        test: 'thing',
      });
      expect(getStorageItemSpy).toHaveBeenCalledWith('toolkit-feature:setting', {
        parse: true,
        test: 'thing',
      });
    });

    it('should resolve a list of values', async () => {
      const { storage } = setup();
      jest.spyOn(storage, 'getStorageItem').mockReturnValue(Promise.resolve('result'));
      const results = await storage.getFeatureSettings(['test', 'setting']);
      expect(Array.isArray(results)).toEqual(true);
      expect(results).toHaveLength(2);
      results.forEach(result => {
        expect(result).toEqual('result');
      });
    });
  });

  describe('setFeatureSetting', () => {
    it('should call setStorageItem with feature-namespaced key', () => {
      const { storage } = setup();
      const setStorageItemSpy = jest.spyOn(storage, 'setStorageItem');
      storage.setFeatureSetting('testSetting', 'ynab');
      expect(setStorageItemSpy).toHaveBeenCalledWith('toolkit-feature:testSetting', 'ynab', {});
    });

    it('should allow overrides of options', () => {
      const { storage } = setup();
      const setStorageItemSpy = jest.spyOn(storage, 'setStorageItem');
      storage.setFeatureSetting('testSetting', 'ynab', { parse: false });
      expect(setStorageItemSpy).toHaveBeenCalledWith('toolkit-feature:testSetting', 'ynab', {
        parse: false,
      });
    });
  });

  describe('removeFeatureSetting', () => {
    it('should call removeStorageItem with feature-namespaced key', () => {
      const { storage } = setup();
      const removeStorageItemSpy = jest.spyOn(storage, 'removeStorageItem');
      storage.removeFeatureSetting('testSetting');
      expect(removeStorageItemSpy).toHaveBeenCalledWith('toolkit-feature:testSetting', {});
    });

    it('should allow overrides of options', () => {
      const { storage } = setup();
      const removeStorageItemSpy = jest.spyOn(storage, 'removeStorageItem');
      storage.removeFeatureSetting('testSetting', { parse: false });
      expect(removeStorageItemSpy).toHaveBeenCalledWith('toolkit-feature:testSetting', {
        parse: false,
      });
    });
  });

  describe('getStorageItem', () => {
    it('should return the value from web-extensions storage', async () => {
      const { storage } = setup({
        storage: {
          item: 'mock-value',
        },
      });
      const actual = await storage.getStorageItem('item');
      expect(actual).toEqual('mock-value');
    });

    it('should parse the data by default', async () => {
      const { storage } = setup({
        storage: {
          item: 'true',
        },
      });
      const actual = await storage.getStorageItem('item');
      expect(typeof actual).toEqual('boolean');
      expect(actual).toEqual(true);
    });

    it('should not parse the data when fetching all storage items', async () => {
      const { storage } = setup({
        storage: {
          item: 'true',
        },
      });
      const actual = await storage.getStorageItem(null);
      expect(actual).toEqual({ item: 'true' });
    });

    it("shouldn't parse if parse option is false", async () => {
      const { storage } = setup({
        storage: {
          item: 'true',
        },
      });
      const actual = await storage.getStorageItem('item', { parse: false });
      expect(actual).toEqual('true');
    });

    it('should return the default if specified and there is no value in storage', async () => {
      const { storage } = setup();
      const actual = await storage.getStorageItem('not-there', {
        default: 'mock-default',
      });
      expect(actual).toEqual('mock-default');
    });
  });

  describe('removeStorageItem', () => {
    it('should call remove on the storage area', () => {
      const { storage } = setup();
      storage.removeStorageItem('item');
      expect(getBrowser().storage.local.remove).toHaveBeenCalledWith('item', expect.any(Function));
    });
  });

  describe('setStorageItem', () => {
    it('should call set on the storage area', () => {
      const { storage } = setup();
      storage.setStorageItem('item', 'test');
      expect(getBrowser().storage.local.set).toHaveBeenCalledWith(
        { item: 'test' },
        expect.any(Function)
      );
    });
  });

  describe('getStoredFeatureSettings', () => {
    it('should return the names of stored feature settings without the feature prefix', async () => {
      const { storage } = setup({
        storage: {
          'toolkit-feature:test': 'value',
          someOtherSetting: 'thing',
        },
      });

      const actual = await storage.getStoredFeatureSettings();
      expect(actual).toHaveLength(1);
      expect(actual[0]).toEqual('test');
    });
  });

  describe('onStorageItemChanged', () => {
    it('registers a callback which is called when the registered key changes', () => {
      const { storage } = setup();
      const callback = jest.fn();

      storage.onStorageItemChanged('mock', callback);
      getBrowser().storage.mock.triggerOnChangedListeners({ mock: 'newValue' }, 'local');
      expect(callback).toHaveBeenCalled();
    });

    it('should call all registered callbacks', () => {
      const { storage } = setup();
      const callback = jest.fn();
      const callback2 = jest.fn();

      storage.onStorageItemChanged('mock', callback);
      storage.onStorageItemChanged('mock', callback2);
      getBrowser().storage.mock.triggerOnChangedListeners({ mock: 'newValue' }, 'local');
      expect(callback).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it("should ignore changes to storageAreas we're not created for", () => {
      const { storage } = setup();
      const callback = jest.fn();

      storage.onStorageItemChanged('mock', callback);
      getBrowser().storage.mock.triggerOnChangedListeners({ mock: 'newValue' }, 'sync');
      expect(callback).not.toHaveBeenCalled();
    });

    it("should ignore changes to keys that don't have a registered callback", () => {
      setup();
      expect(() => {
        getBrowser().storage.mock.triggerOnChangedListeners({ mock: 'data' }, 'local');
      }).not.toThrow();
    });
  });

  describe('offStorageItemChanged', () => {
    it('should remove the provided callback from registered callbacks for the given key', () => {
      const { storage } = setup();
      const callback = jest.fn();

      storage.onStorageItemChanged('mock', callback);
      getBrowser().storage.mock.triggerOnChangedListeners({ mock: 'newValue' }, 'local');
      expect(callback).toHaveBeenCalled();

      callback.mockReset();
      storage.offStorageItemChanged('mock', callback);
      getBrowser().storage.mock.triggerOnChangedListeners({ mock: 'newValue' }, 'local');
      expect(callback).not.toHaveBeenCalled();
    });

    it('should allow remove even if no listener exists', () => {
      const { storage } = setup();
      expect(() => {
        storage.offStorageItemChanged('mock', jest.fn());
      }).not.toThrow();
    });
  });

  describe('onFeatureSettingChanged', () => {
    it('should call onStorageItemChanged with a feature-namespaced key', () => {
      const { storage } = setup();
      const onStorageItemChangedSpy = jest.spyOn(storage, 'onStorageItemChanged');
      const mockCallback = jest.fn();
      storage.onFeatureSettingChanged('test', mockCallback);
      expect(onStorageItemChangedSpy).toHaveBeenCalledWith('toolkit-feature:test', mockCallback);
    });
  });

  describe('offFeatureSettingChanged', () => {
    it('should call offStorageItemChanged with a feature-namespaced key', () => {
      const { storage } = setup();
      const offStorageItemChangedSpy = jest.spyOn(storage, 'offStorageItemChanged');
      const mockCallback = jest.fn();
      storage.offFeatureSettingChanged('test', mockCallback);
      expect(offStorageItemChangedSpy).toHaveBeenCalledWith('toolkit-feature:test', mockCallback);
    });
  });
});
