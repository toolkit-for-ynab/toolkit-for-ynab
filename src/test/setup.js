import { Chrome } from 'toolkit/test/mocks/web-extensions/chrome';
import { Ember } from 'toolkit/test/mocks/ember';
import { allToolkitSettings } from 'toolkit/core/settings/settings';
import $ from 'jquery';

process.on('unhandledRejection', console.log.bind(console));

function resetWebExtensionsAPI() {
  let webExtensionsAPI = new Chrome();
  global.chrome = webExtensionsAPI;
  global.browser = webExtensionsAPI;
}

export function readyYNAB(options = {}) {
  const ember = new Ember();
  const toolkitOptions = allToolkitSettings.reduce((settings, current) => {
    settings[current.name] = false;
    return settings;
  }, {});

  global.Ember = ember;
  global.Em = ember;
  global.$ = $;
  global.ynabToolKit = options.ynabToolKit || { options: toolkitOptions };
  global.__ynabapp__ = {
    lookup: jest.fn(),
    __container__: {
      cache: {},
    },
  };
}

export function unreadyYNAB() {
  global.Ember = undefined;
  global.Em = undefined;
  global.$ = undefined;
  global.ynabToolKit = undefined;
  global.__ynabapp__ = undefined;
}

beforeEach(() => {
  resetWebExtensionsAPI();
  readyYNAB();

  localStorage.clear();
});

resetWebExtensionsAPI();
readyYNAB();
