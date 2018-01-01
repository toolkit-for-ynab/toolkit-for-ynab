import { Chrome } from 'toolkit/test/mocks/web-extensions/chrome';

function resetWebExtensionsAPI() {
  let webExtensionsAPI = new Chrome();
  global.chrome = webExtensionsAPI;
  global.browser = webExtensionsAPI;
}

beforeEach(() => {
  resetWebExtensionsAPI();

  localStorage.clear();
});

resetWebExtensionsAPI();
