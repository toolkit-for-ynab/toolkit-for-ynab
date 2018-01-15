import { Chrome } from 'toolkit/test/mocks/web-extensions/chrome';
import { Ember } from 'toolkit/test/mocks/ember';
import $ from 'jquery';

process.on('unhandledRejection', console.log.bind(console));

function resetWebExtensionsAPI() {
  let webExtensionsAPI = new Chrome();
  global.chrome = webExtensionsAPI;
  global.browser = webExtensionsAPI;
}

export function readyYNAB(options = {}) {
  const ember = new Ember();

  global.Ember = ember;
  global.Em = ember;
  global.$ = $;
  global.ynabToolKit = options.ynabToolKit || {};
}

export function unreadyYNAB() {
  global.Ember = undefined;
  global.Em = undefined;
  global.$ = undefined;
  global.ynabToolKit = undefined;
}

beforeEach(() => {
  resetWebExtensionsAPI();
  readyYNAB();

  localStorage.clear();
});

resetWebExtensionsAPI();
readyYNAB();
