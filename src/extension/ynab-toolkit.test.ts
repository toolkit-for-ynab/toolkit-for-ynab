jest.useFakeTimers();
jest.mock('toolkit/extension/utils/ynab');
jest.mock('toolkit/extension/listeners/observeListener');
jest.mock('toolkit/extension/listeners/routeChangeListener');
import { YNABToolkit } from './ynab-toolkit';
import { allToolkitSettings } from 'toolkit/core/settings';
import { isYNABReady } from 'toolkit/extension/utils/ynab';
import { readyYNAB, unreadyYNAB } from 'toolkit/test/setup';
import { OutboundMessageType, InboundMessageType, BootstrapMessage } from 'toolkit/core/messages';
import { YNABToolkitObject } from 'toolkit/types/toolkit';

const mockIsYNABReady = isYNABReady as jest.Mock;

const setup = (setupOptions = {}) => {
  const options = {
    initialize: true,
    sendBootstrap: false,
    ...setupOptions,
  };

  let messageCallback: EventListener;
  const addEventListenerSpy = jest
    .spyOn(window, 'addEventListener')
    .mockImplementation((_, callback: any) => {
      messageCallback = callback;
    });

  const postMessageSpy = jest.spyOn(window, 'postMessage');
  const callMessageListener = (...args: any[]) => {
    messageCallback.apply(null, args as any);
  };

  const ynabToolkit = new YNABToolkit();
  if (options.initialize) {
    ynabToolkit.initializeToolkit();
  }

  const bootstrapData: BootstrapMessage['data'] = {
    type: InboundMessageType.Bootstrap,
    ynabToolKit: {
      assets: {
        logo: 'logoURL',
      },
      environment: 'test' as YNABToolkitObject['environment'],
      extensionId: 'extensionId',
      name: 'extension',
      version: 'extensionVersion',
      options: {} as any,
    },
  };

  allToolkitSettings.forEach((setting) => {
    bootstrapData.ynabToolKit.options[setting.name] = false;
  });

  if (options.sendBootstrap) {
    callMessageListener({
      source: window,
      data: bootstrapData,
    });
  }

  return {
    addEventListenerSpy,
    callMessageListener,
    postMessageSpy,
    bootstrapData,
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
      expect(postMessageSpy).toHaveBeenCalledWith({ type: OutboundMessageType.ToolkitLoaded }, '*');
    });
  });

  describe('once the InboundMessageType.Bootstrap message is received', () => {
    it('should create the ynabToolKit global object', () => {
      const { bootstrapData } = setup({ sendBootstrap: true });
      expect(window.ynabToolKit).toMatchObject(bootstrapData.ynabToolKit);
    });

    it('should poll for YNAB to be ready', () => {
      mockIsYNABReady.mockReturnValueOnce(false);

      const { bootstrapData } = setup({ sendBootstrap: true });

      // first poll attempt
      jest.runOnlyPendingTimers();
      expect(window.ynabToolKit.invokeFeature).toBeUndefined();

      // second poll attempt
      mockIsYNABReady.mockReturnValueOnce(false);
      jest.runOnlyPendingTimers();
      expect(window.ynabToolKit.invokeFeature).toBeUndefined();

      // third poll attempt
      readyYNAB({ ynabToolKit: bootstrapData.ynabToolKit });
      mockIsYNABReady.mockReturnValueOnce(true);
      jest.runOnlyPendingTimers();
      expect(window.ynabToolKit.invokeFeature).toEqual(expect.any(Function));
    });

    describe('once YNAB is ready', () => {
      it('should set invokeFeature on the global ynabToolKit object', () => {
        readyYNAB();
        mockIsYNABReady.mockReturnValueOnce(true);
        setup({ sendBootstrap: true });
        expect(window.ynabToolKit.invokeFeature).toEqual(expect.any(Function));
      });

      it('should apply the globalCSS to the HEAD', () => {
        readyYNAB();
        mockIsYNABReady.mockReturnValueOnce(true);
        setup({ sendBootstrap: true });
        expect($('head #tk-global-styles').length).toEqual(1);
      });
    });
  });
});
