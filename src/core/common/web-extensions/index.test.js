import * as webExtensions from './index';

describe('web-extensions', () => {
  describe('getBrowser()', () => {
    it("should return browser if it's defined", () => {
      global.chrome = undefined;
      expect(webExtensions.getBrowser()).toEqual(global.browser);
    });

    it('should return chrome if browser is not defined', () => {
      global.browser = undefined;
      expect(webExtensions.getBrowser()).toEqual(global.chrome);
    });

    it('should return undefined if chrome/browser are not defined', () => {
      global.browser = undefined;
      global.chrome = undefined;
      expect(webExtensions.getBrowser()).toBeUndefined();
    });
  });

  describe('getBrowserName()', () => {
    it('should return chrome if runtime.getURL() starts with chrome-extension://', () => {
      chrome.runtime.getURL.mockReturnValueOnce('chrome-extension://mock');
      expect(webExtensions.getBrowserName()).toEqual('chrome');
      expect(chrome.runtime.getURL).toHaveBeenCalledWith('');
    });

    it('should return firefox if runtime.getURL() starts with moz-extension://', () => {
      chrome.runtime.getURL.mockReturnValueOnce('moz-extension://mock');
      expect(webExtensions.getBrowserName()).toEqual('firefox');
      expect(chrome.runtime.getURL).toHaveBeenCalledWith('');
    });

    it('should return edge if runtime.getURL() starts with ms-browser-extension://', () => {
      chrome.runtime.getURL.mockReturnValueOnce('ms-browser-extension://mock');
      expect(webExtensions.getBrowserName()).toEqual('edge');
      expect(chrome.runtime.getURL).toHaveBeenCalledWith('');
    });

    it('should return empty string if runtime.getURL() starts with an unexpected string', () => {
      chrome.runtime.getURL.mockReturnValueOnce('unexpected://mock');
      expect(webExtensions.getBrowserName()).toEqual('');
      expect(chrome.runtime.getURL).toHaveBeenCalledWith('');
    });
  });
});
