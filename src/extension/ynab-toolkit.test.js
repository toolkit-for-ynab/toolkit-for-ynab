jest.useFakeTimers();
jest.mock('toolkit/extension/utils/ynab');
jest.mock('toolkit/extension/listeners/observeListener');
jest.mock('toolkit/extension/listeners/routeChangeListener');
import { YNABToolkit, TOOLKIT_LOADED_MESSAGE, TOOLKIT_BOOTSTRAP_MESSAGE } from './ynab-toolkit';
import { allToolkitSettings } from 'toolkit/core/settings';
import { isYNABReady } from 'toolkit/extension/utils/ynab';
import { readyYNAB, unreadyYNAB } from 'toolkit/test/setup';

const setup = (setupOptions = {}) => {
  const options = {
    initialize: true,
    sendBootstrap: false,
    ...setupOptions,
  };

  let messageCallback;
  const addEventListenerSpy = jest
    .spyOn(window, 'addEventListener')
    .mockImplementation((event, callback) => {
      messageCallback = callback;
    });

  const postMessageSpy = jest.spyOn(window, 'postMessage');
  const callMessageListener = (...args) => {
    messageCallback.apply(null, args);
  };

  const ynabToolkit = new YNABToolkit();
  if (options.initialize) {
    ynabToolkit.initializeToolkit();
  }

  const toolkitBootstrap = { hookedComponents: new Set(), options: {} };
  allToolkitSettings.forEach(setting => {
    toolkitBootstrap.options[setting.name] = false;
  });

  if (options.sendBootstrap) {
    callMessageListener({
      source: window,
      data: {
        type: TOOLKIT_BOOTSTRAP_MESSAGE,
        ynabToolKit: toolkitBootstrap,
      },
    });
  }

  return {
    addEventListenerSpy,
    callMessageListener,
    postMessageSpy,
    toolkitBootstrap,
    ynabToolkit,
  };
};

describe('YNABToolkit', () => {
  beforeEach(() => {
    unreadyYNAB();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('.initializeToolkit()', () => {
    it('should attach a message listener to the window', () => {
      const { addEventListenerSpy, ynabToolkit } = setup({ initialize: false });
      ynabToolkit.initializeToolkit();
      expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should postMessage the toolkit loaded message', () => {
      const { postMessageSpy, ynabToolkit } = setup({ initialize: false });
      ynabToolkit.initializeToolkit();
      expect(postMessageSpy).toHaveBeenCalledWith({ type: TOOLKIT_LOADED_MESSAGE }, '*');
    });
  });

  describe('once the TOOLKIT_BOOTSTRAP_MESSAGE is received', () => {
    it('should create the ynabToolKit global object', () => {
      const { toolkitBootstrap } = setup({ sendBootstrap: true });
      expect(global.ynabToolKit).toEqual(toolkitBootstrap);
    });

    it('should poll for YNAB to be ready', () => {
      isYNABReady.mockReturnValueOnce(false);

      const { toolkitBootstrap } = setup({ sendBootstrap: true });

      // first poll attempt
      jest.runOnlyPendingTimers();
      expect(global.ynabToolKit.invokeFeature).toBeUndefined();

      // second poll attempt
      isYNABReady.mockReturnValueOnce(false);
      jest.runOnlyPendingTimers();
      expect(global.ynabToolKit.invokeFeature).toBeUndefined();

      // third poll attempt
      readyYNAB({ ynabToolKit: toolkitBootstrap });
      isYNABReady.mockReturnValueOnce(true);
      jest.runOnlyPendingTimers();
      expect(global.ynabToolKit.invokeFeature).toEqual(expect.any(Function));
    });

    describe('once YNAB is ready', () => {
      it('should set invokeFeature on the global ynabToolKit object', () => {
        readyYNAB();
        isYNABReady.mockReturnValueOnce(true);
        setup({ sendBootstrap: true });

        expect(ynabToolKit.invokeFeature).toEqual(expect.any(Function));
      });

      it('should apply the globalCSS to the HEAD', () => {
        readyYNAB();
        isYNABReady.mockReturnValueOnce(true);
        setup({ sendBootstrap: true });

        expect($('head #toolkit-injected-styles').length).toEqual(1);
      });
    });
  });
});
