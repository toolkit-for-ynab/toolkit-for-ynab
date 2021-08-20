export enum Browser {
  Chrome = 'chrome',
  Edge = 'edge',
  Firefox = 'firefox',
}

export const BrowserExtensionPrefix = {
  [Browser.Chrome]: 'chrome-extension://',
  [Browser.Edge]: 'ms-browser-extension://',
  [Browser.Firefox]: 'moz-extension://',
};

export enum Environment {
  Beta = 'beta',
  Development = 'development',
  Production = 'production',
}

export const ExtensionIds = {
  ChromeBeta: 'mkgdgjnaaejddflnldinkilabeglghlo',
  ChromeProduction: 'lmhdkkhepllpnondndgpgclfjnlofgjl',
  FirefoxProduction: '{4F1FB113-D7D8-40AE-A5BA-9300EAEA0F51}',
};

export const ExtensionIdEnvironmentMap = {
  [ExtensionIds.ChromeBeta]: Environment.Beta,
  [ExtensionIds.ChromeProduction]: Environment.Production,
  [ExtensionIds.FirefoxProduction]: Environment.Production,
};
