import { getBrowser } from 'toolkit/core/common/web-extensions';
import { ToolkitStorage } from 'toolkit/core/common/storage';
import { allToolkitSettings, getUserSettings } from 'toolkit/core/settings';
import { injectCSS, injectScript } from './dom-injectors';
import { getEnvironment } from 'toolkit/core/common/web-extensions';

const storage = new ToolkitStorage();

function applySettingsToDom(userSettings) {
  allToolkitSettings.forEach(setting => {
    let userSettingValue = userSettings[setting.name];
    // Check for specific upgrade path where a boolean setting gets
    // changed to a select. Previous value will be 'true' but
    // that should map to '1' in select land.
    // eslint-disable-next-line eqeqeq
    if (
      setting.actions &&
      userSettingValue === true &&
      '1' in setting.actions &&
      !('true' in setting.actions)
    ) {
      userSettingValue = '1';
    }

    if (setting.actions && userSettingValue in setting.actions) {
      const selectedActions = setting.actions[userSettingValue.toString()];
      for (let i = 0; i < selectedActions.length; i += 2) {
        const action = selectedActions[i];
        const target = selectedActions[i + 1];

        if (action === 'injectCSS') {
          injectCSS(`web-accessibles/${target}`);
        } else if (action === 'injectScript') {
          injectScript(`web-accessibles/${target}`);
        } else {
          const error = `Invalid Action: "${action}". Only injectCSS and injectScript are currently supported.`;
          throw error;
        }
      }
    }
  });
}

function sendToolkitBootstrap(options) {
  const browser = getBrowser();
  const environment = getEnvironment();
  const manifest = browser.runtime.getManifest();

  window.postMessage(
    {
      type: 'ynab-toolkit-bootstrap',
      ynabToolKit: {
        assets: {
          logo: browser.runtime.getURL('assets/images/logos/toolkitforynab-logo-200.png'),
        },
        environment,
        extensionId: browser.runtime.id,
        name: manifest.name,
        options,
        version: manifest.version,
      },
    },
    '*'
  );
}

function messageHandler(event) {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'ynab-toolkit-loaded':
        initializeYNABToolkit();
        break;
      case 'ynab-toolkit-error':
        handleToolkitError(event.data.context);
        break;
    }
  }
}

function handleToolkitError(context) {
  getBrowser().runtime.sendMessage({ type: 'error', context });
}

async function initializeYNABToolkit() {
  const userSettings = await getUserSettings();
  sendToolkitBootstrap(userSettings);

  /* Load this to setup shared utility functions */
  injectScript('web-accessibles/legacy/features/shared/main.js');

  /* Global toolkit css. */
  injectCSS('web-accessibles/legacy/features/shared/main.css');

  /* This script to be built automatically by the python script */
  injectScript('web-accessibles/legacy/features/act-on-change/feedChanges.js');

  /* Load this to setup behaviors when the DOM updates and shared functions */
  injectScript('web-accessibles/legacy/features/act-on-change/main.js');

  applySettingsToDom(userSettings);
}

async function init() {
  const isToolkitDisabled = await storage.getFeatureSetting('DisableToolkit');
  if (isToolkitDisabled) {
    console.log(`${getBrowser().runtime.getManifest().name} is disabled!`);
    return;
  }

  // Load the toolkit bundle onto the YNAB dom
  injectScript('web-accessibles/ynab-toolkit.js');

  // wait for the bundle to tell us it's loaded
  window.addEventListener('message', messageHandler);
}

init();
