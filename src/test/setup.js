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

  global.requireModule = (module) => {
    switch (module) {
      case 'ember':
        return {
          default: {
            ...ember,
            Namespace: {
              NAMESPACES: [
                {
                  lookup: jest.fn(),
                  __container__: {
                    cache: {},
                  },
                },
              ],
            },
          },
        };
      case '@ember/runloop':
        return ember.run;
    }
  };
  global.$ = $;
  global.ynabToolKit = options.ynabToolKit || { options: toolkitOptions };
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
