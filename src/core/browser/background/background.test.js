jest.mock('toolkit/core/common/storage');
import { pause } from 'toolkit/test/utils/pause';
import { Background, NEXT_UPDATE_CHECK_STORAGE_KEY } from './background';
import { mockToolkitStorage } from 'toolkit/test/mocks/toolkit-storage';
import { setupWithLocalStorage } from 'toolkit/test/utils/setup';

const DISABLE_TOOLKIT_FEATURE_KEY = 'DisableToolkit';
const setup = setupWithLocalStorage((setupOptions = {}) => {
  const options = {
    isToolkitDisabled: false,
    ...setupOptions,
  };

  mockToolkitStorage.getFeatureSetting.mockReturnValue(Promise.resolve(options.isToolkitDisabled));

  return {
    background: new Background(),
  };
});

describe('Background', () => {
  beforeEach(() => {
    mockToolkitStorage.mock.clearMock();
  });

  describe('constructor', () => {
    it('should set browserAction icon to the default if DisableToolkit setting is false', async () => {
      setup({ isToolkitDisabled: false });

      await pause();
      expect(mockToolkitStorage.getFeatureSetting).toHaveBeenCalledWith(
        DISABLE_TOOLKIT_FEATURE_KEY
      );
      expect(chrome.browserAction.setIcon).toHaveBeenCalledWith({
        path: expect.stringMatching(/\/\/assets\/images\/icons\/button.png/),
      });
    });

    it('should set browserAction icon to disabled if DisableToolkit setting is true', async () => {
      setup({ isToolkitDisabled: true });

      await pause();
      expect(mockToolkitStorage.getFeatureSetting).toHaveBeenCalledWith(
        DISABLE_TOOLKIT_FEATURE_KEY
      );
      expect(chrome.browserAction.setIcon).toHaveBeenCalledWith({
        path: expect.stringMatching(/\/\/assets\/images\/icons\/button-disabled.png/),
      });
    });
  });

  describe('background.initListeners()', () => {
    it('should attach a listener to runtime.onMessage', () => {
      const { background } = setup();
      background.initListeners();
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalledTimes(1);
    });

    it('should attach a listener to toolkitStorage.onFeatureSettingChanged for DisableToolkit', () => {
      const { background } = setup();
      background.initListeners();
      expect(mockToolkitStorage.onFeatureSettingChanged).toHaveBeenCalledWith(
        DISABLE_TOOLKIT_FEATURE_KEY,
        expect.any(Function)
      );
    });

    it('should attach a listener to onUpdateAvailable', () => {
      const { background } = setup();
      background.initListeners();
      expect(chrome.runtime.onUpdateAvailable.addListener).toHaveBeenCalledTimes(1);
    });

    describe('checks for updates', () => {
      let dateNowSpy;
      let originalDateNow = Date.now.bind(global.Date);
      beforeEach(() => {
        dateNowSpy = jest.fn().mockReturnValue(1000);
        global.Date.now = dateNowSpy;
      });

      afterEach(() => {
        global.Date.now = originalDateNow;
      });

      it('requests an update check when there is no stored next-update-check', async () => {
        const { background } = setup({ storage: {} });
        background.initListeners();
        await pause();
        expect(chrome.runtime.requestUpdateCheck).toHaveBeenCalledTimes(1);
      });

      it('does not request an update check when the current time is before next-update-check', async () => {
        mockToolkitStorage.getStorageItem.mockResolvedValueOnce(1001);
        const { background } = setup();
        background.initListeners();
        await pause();
        expect(chrome.runtime.requestUpdateCheck).not.toHaveBeenCalled();
      });

      it('requests an update check when the current time is after next-update-check', async () => {
        mockToolkitStorage.getStorageItem.mockResolvedValueOnce(999);
        const { background } = setup();
        background.initListeners();
        await pause();
        expect(chrome.runtime.requestUpdateCheck).toHaveBeenCalled();
      });

      describe('requestUpdateCheck callback', () => {
        it('sets the next update check appropriately', async () => {
          mockToolkitStorage.getStorageItem.mockResolvedValueOnce(999);
          chrome.runtime.requestUpdateCheck.mockImplementation(cb => cb());

          const { background } = setup();
          background.initListeners();
          await pause();
          expect(mockToolkitStorage.setStorageItem).toHaveBeenCalledWith(
            NEXT_UPDATE_CHECK_STORAGE_KEY,
            1000 + 1000 * 60 * 60
          );
        });

        it('adds an hour if the requestUpdateCheck status is throttled', async () => {
          mockToolkitStorage.getStorageItem.mockResolvedValueOnce(999);
          chrome.runtime.requestUpdateCheck.mockImplementation(cb => cb('throttled'));

          const { background } = setup();
          background.initListeners();
          await pause();
          expect(mockToolkitStorage.setStorageItem).toHaveBeenCalledWith(
            NEXT_UPDATE_CHECK_STORAGE_KEY,
            1000 + 1000 * 60 * 60 * 2
          );
        });
      });
    });
  });

  describe('onUpdateAvailable', () => {
    it('reloads the extension', () => {});
  });

  describe('on storage messages', () => {
    describe('on type: keys', () => {
      it('should return an array of keys in localStorage', () => {
        const mockLocalStorage = {
          mockSetting1: true,
          mockSetting2: false,
        };

        const { background } = setup({ localStorage: mockLocalStorage });

        background.initListeners();

        const response = chrome.runtime.mock.triggerOnMessage({
          type: 'storage',
          content: {
            type: 'keys',
          },
        });

        expect(response).toHaveBeenCalledWith(Object.keys(localStorage));
      });
    });

    describe('on type: get', () => {
      it('should return the value of the key in localStorage', () => {
        const mockLocalStorage = {
          mockSetting1: true,
          mockSetting2: false,
        };

        const { background } = setup({ localStorage: mockLocalStorage });

        background.initListeners();

        const response = chrome.runtime.mock.triggerOnMessage({
          type: 'storage',
          content: {
            type: 'get',
            itemName: 'mockSetting1',
          },
        });

        expect(response).toHaveBeenCalledWith('true');
      });
    });

    describe('on an unexpected type', () => {
      it('should not call the response callback', () => {
        const mockLocalStorage = {
          mockSetting1: true,
          mockSetting2: false,
        };

        const { background } = setup({ localStorage: mockLocalStorage });

        background.initListeners();

        const response = chrome.runtime.mock.triggerOnMessage({
          type: 'storage',
          content: {
            type: 'unexpected',
          },
        });

        expect(response).not.toHaveBeenCalled();
      });
    });
  });

  describe('on unexpected messages', () => {
    it('should not call the response callback', () => {
      const { background } = setup();

      background.initListeners();

      const response = chrome.runtime.mock.triggerOnMessage({
        type: 'unexpected',
        content: {
          type: 'keys',
        },
      });

      expect(response).not.toHaveBeenCalled();
    });
  });
});
