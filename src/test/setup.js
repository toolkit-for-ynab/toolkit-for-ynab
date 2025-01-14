import { Chrome } from 'toolkit/test/mocks/web-extensions/chrome';
import { allToolkitSettings } from 'toolkit/core/settings/settings';
import $ from 'jquery';

process.on('unhandledRejection', console.log.bind(console));

function resetWebExtensionsAPI() {
  let webExtensionsAPI = new Chrome();
  global.chrome = webExtensionsAPI;
  global.browser = webExtensionsAPI;
}

export function readyYNAB(options = {}) {
  const toolkitOptions = allToolkitSettings.reduce((settings, current) => {
    settings[current.name] = false;
    return settings;
  }, {});

  global.$ = $;
  global.ynabToolKit = options.ynabToolKit || { options: toolkitOptions };
  global.YNAB = {
    NAMESPACES: [
      {
        lookup: jest.fn(),
        __container__: {
          cache: {},
        },
      },
    ],
  };
}

export function unreadyYNAB() {
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
