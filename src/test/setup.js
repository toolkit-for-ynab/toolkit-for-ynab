import { Chrome } from 'toolkit/test/mocks/web-extensions/chrome';

let webExtensionsAPI = new Chrome();
global.chrome = webExtensionsAPI;
global.browser = webExtensionsAPI;

beforeEach(() => {
  webExtensionsAPI = new Chrome();
  global.chrome = webExtensionsAPI;
  global.browser = webExtensionsAPI;

  localStorage.clear();
});
