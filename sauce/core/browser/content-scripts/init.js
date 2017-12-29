import { getBrowser } from 'toolkit/core/common/web-extensions';
import { ToolkitStorage } from 'toolkit/core/common/storage';
import { allToolkitSettings, getUserSettings } from 'toolkit/core/settings';
import { injectCSS, injectScript } from './dom-injectors';

const storage = new ToolkitStorage();

function applySettingsToDom(userSettings) {
  allToolkitSettings.forEach((setting) => {
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
          injectCSS(target);
        } else if (action === 'injectScript') {
          injectScript(target);
        } else {
          const error = `Invalid Action: "${action}". Only injectCSS and injectScript are currently supported.`;
          throw error;
        }
      }
    }
  });
}

function sendToolkitBootstrap(userSettings) {
  window.postMessage({
    type: 'ynab-toolkit-bootstrap',
    ynabToolKit: {
      version: getBrowser().runtime.getManifest().version,
      options: userSettings
    }
  }, '*');
}

function messageHandler(event) {
  if (event.data !== 'ynab-toolkit-loaded') return;

  initializeYNABToolkit();
  window.removeEventListener('message', messageHandler);
}

function initializeYNABToolkit() {
  getUserSettings().then((userSettings) => {
    sendToolkitBootstrap(userSettings);

    /* Load this to setup shared utility functions */
    injectScript('toolkit/legacy/features/shared/main.js');

    /* Global toolkit css. */
    injectCSS('toolkit/legacy/features/shared/main.css');

    /* This script to be built automatically by the python script */
    injectScript('toolkit/legacy/features/act-on-change/feedChanges.js');

    /* Load this to setup behaviors when the DOM updates and shared functions */
    injectScript('toolkit/legacy/features/act-on-change/main.js');

    applySettingsToDom(userSettings);
  });
}

storage.getFeatureSetting('DisableToolkit').then((isToolkitDisabled) => {
  if (isToolkitDisabled) {
    console.log('Toolkit-for-YNAB is disabled!');
    return;
  }

  // Load the toolkit bundle onto the YNAB dom
  injectScript('toolkit/toolkit.js');

  // wait for the bundle to tell us it's loaded
  window.addEventListener('message', messageHandler);
});
