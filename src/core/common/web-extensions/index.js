import { Browsers, BrowserExtensionPrefixMap, Environment, ExtensionIdEnvironmentMap } from 'toolkit/core/common/constants';

export const getBrowser = () => {
  if (typeof browser !== 'undefined') {
    return browser;
  } else if (typeof chrome !== 'undefined') {
    return chrome;
  }
};

export function getBrowserName() {
  const _browser = getBrowser(); // browser is global so use _ to namespace
  const URL = _browser.runtime.getURL('');

  if (URL.startsWith(BrowserExtensionPrefixMap.Chrome)) {
    return Browsers.Chrome;
  } else if (URL.startsWith(BrowserExtensionPrefixMap.Firefox)) {
    return Browsers.Firefox;
  } else if (URL.startsWith(BrowserExtensionPrefixMap.Edge)) {
    return Browsers.Edge;
  }

  return '';
}

export function getEnvironment() {
  const _browser = getBrowser(); // browser is global so use _ to namespace
  const extensionId = _browser.runtime.id;

  const environment = ExtensionIdEnvironmentMap[extensionId];
  return environment || Environment.Development;
}
