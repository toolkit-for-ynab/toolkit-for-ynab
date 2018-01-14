import { YNABToolkit, TOOLKIT_LOADED_MESSAGE, TOOLKIT_BOOTSTRAP_MESSAGE } from './ynab-toolkit';
import { allToolkitSettings } from 'toolkit/core/settings';

const setup = (setupOptions = {}) => {
  const options = {
    initialize: true,
    ...setupOptions
  };

  let messageCallback;
  const addEventListenerSpy = jest.spyOn(window, 'addEventListener').mockImplementation((event, callback) => {
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

  const toolkitBootStrap = { options: {} };
  allToolkitSettings.forEach((setting) => {
    toolkitBootStrap.options[setting.name] = true;
  });

  return {
    addEventListenerSpy,
    callMessageListener,
    postMessageSpy,
    toolkitBootStrap,
    ynabToolkit
  };
};

describe('YNABToolkit', () => {
  describe('.initializeToolkit()', () => {
    it('should attach a message listener to the window', () => {
      const { addEventListenerSpy, ynabToolkit } = setup({ initialize: false });
      ynabToolkit.initializeToolkit();
      expect(addEventListenerSpy).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should postMessage the toolkit loaded message', () => {
      const { postMessageSpy, ynabToolkit } = setup({ initialize: false });
      ynabToolkit.initializeToolkit();
      expect(postMessageSpy).toHaveBeenCalledWith(TOOLKIT_LOADED_MESSAGE, '*');
    });
  });

  describe('once the TOOLKIT_BOOTSTRAP_MESSAGE is received', () => {
    it('should create the ynabToolKit global object', () => {
      const { callMessageListener, toolkitBootStrap } = setup();
      callMessageListener({
        source: window,
        data: {
          type: TOOLKIT_BOOTSTRAP_MESSAGE,
          ynabToolKit: toolkitBootStrap
        }
      });

      expect(global.ynabToolKit).toEqual(toolkitBootStrap);
    });

    describe('once YNAB is ready', () => {
      // TODO
    });
  });
});
