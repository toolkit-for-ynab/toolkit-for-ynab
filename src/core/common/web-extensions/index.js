export const getBrowser = () => {
  if (typeof browser !== 'undefined') {
    return browser;
  } else if (typeof chrome !== 'undefined') {
    return chrome;
  }
};

export function getBrowserName() {
  const _browser = getBrowser();
  const URL = _browser.runtime.getURL('');

  if (URL.startsWith('chrome-extension://')) {
    return 'chrome';
  } else if (URL.startsWith('moz--extension://')) {
    return 'firefox';
  } else if (URL.startsWith('ms-browser-extension://')) {
    return 'edge';
  }

  return '';
}
