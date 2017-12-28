import { browser } from 'toolkit/core/common/web-extensions';
import { allToolkitSettings, getUserSettings } from 'toolkit/core/settings';

const previouslyInjectedScripts = [];

function injectCSS(path) {
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', browser.runtime.getURL(path));

  document.getElementsByTagName('head')[0].appendChild(link);
}

function injectScript(path) {
  if (previouslyInjectedScripts.indexOf(path) < 0) {
    previouslyInjectedScripts.push(path);

    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', browser.runtime.getURL(path));

    document.getElementsByTagName('head')[0].appendChild(script);
  }
}

function injectJSString(js) {
  var script = document.createElement('script');
  script.text = js;

  document.getElementsByTagName('head')[0].appendChild(script);
}

function applySettingsToDom(userSettings) {
  console.log(userSettings);

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
        } else if (action === 'injectJSString') {
          injectJSString(target);
        } else {
          const error = `Invalid Action: "${action}". Only injectCSS, injectScript and injectJSString are currently supported.`;
          throw error;
        }
      }
    }
  });
}

getUserSettings().then((userSettings) => {
  if (userSettings.DisableToolkit) {
    console.log('Toolkit-for-YNAB is disabled!');
    return;
  }

  const toolkitVersion = browser.runtime.getManifest().version;
  injectJSString(`
    window.ynabToolKit = { version: '${toolkitVersion}'};
    ynabToolKit.options = ${JSON.stringify(userSettings)};
    Object.freeze(ynabToolKit.options);
    Object.seal(ynabToolKit.options);
  `);

  /* Load this to setup shared utility functions */
  injectScript('toolkit/legacy/features/shared/main.js');

  /* Global toolkit css. */
  injectCSS('toolkit/legacy/features/shared/main.css');

  /* This script to be built automatically by the python script */
  injectScript('toolkit/legacy/features/act-on-change/feedChanges.js');

  /* Load this to setup behaviors when the DOM updates and shared functions */
  injectScript('toolkit/legacy/features/act-on-change/main.js');

  /* Load the ynabToolkit bundle */
  injectScript('toolkit/toolkit.js');

  /* Putting this code here temporarily. Once the resize-inspector feature is refactored to be
  saucy, the call should be moved to the resize-inspector willInvoke() function. */
  injectJSString('window.resizeInspectorAsset = "' + browser.runtime.getURL('assets/vsizegrip.png') + '";');

  /* Used by the new version notification popup */
  injectJSString('window.versionPopupAsset = "' + browser.runtime.getURL('assets/logos/toolkitforynab-logo-400.png') + '";');

  applySettingsToDom(userSettings);
});
