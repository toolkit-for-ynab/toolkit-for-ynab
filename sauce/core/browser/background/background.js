import { ToolkitStorage } from 'toolkit/core/storage';
import { allToolkitSettings, ensureDefaultsAreSet } from 'toolkit/core/settings';
import { browser } from 'toolkit/core/common/web-extensions';

const storage = new ToolkitStorage();
const previouslyInjectedScripts = [];

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

function injectCSS(path) {
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', browser.runtime.getURL(path));

  document.getElementsByTagName('head')[0].appendChild(link);
}

function applySettingsToDom() {
  allToolkitSettings.forEach(function (setting) {
    storage.getFeatureSetting(setting.name).then(function (data) {
      // Check for specific upgrade path where a boolean setting gets
      // changed to a select. Previous value will be 'true' but
      // that should map to '1' in select land.
      // eslint-disable-next-line eqeqeq
      if (data == 'true' &&
        '1' in setting.actions &&
        !('true' in setting.actions)) {
        data = '1';
      }

      if (setting.actions && data in setting.actions) {
        var selectedActions = setting.actions[data.toString()];
        for (var i = 0; i < selectedActions.length; i += 2) {
          var action = selectedActions[i];
          var target = selectedActions[i + 1];

          if (action === 'injectCSS') {
            injectCSS(target);
          } else if (action === 'injectScript') {
            injectScript(target);
          } else if (action === 'injectJSString') {
            injectJSString(target);
          } else {
            var error = "Invalid action '" + action + "'. Only injectCSS, injectScript and injectJSString are currently supported.";
            throw error;
          }
        }
      }
    });
  });
}

/* Init ynabToolKit object and import options from Kango  */
var options = {};
function pushOption(setting) {
  return storage.getFeatureSetting(setting.name).then(function (data) {
    options[setting.name] = data;
  });
}

storage.getFeatureSetting('DisableToolkit').then(shouldDisableToolkit => {
  if (shouldDisableToolkit) {
    // we don't need to do anything else
    console.log('Toolkit-for-YNAB is disabled!');
    return;
  }

  var optionsPromises = [];

  allToolkitSettings.forEach(function (setting) {
    optionsPromises.push(pushOption(setting));
  });

  Promise.all(optionsPromises).then(function () {
    let version = browser.runtime.getManifest().version;

    injectJSString(`
      window.ynabToolKit = { version: '${version}'};
      ynabToolKit.options = ${JSON.stringify(options)};
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
    injectJSString('window.resizeInspectorAsset = "' + browser.runtime.getURL('assets/images/vsizegrip.png') + '";');

    /* Used by the new version notification popup */
    injectJSString('window.versionPopupAsset = "' + browser.runtime.getURL('assets/images/logos/toolkitforynab-logo-400.png') + '";');

    ensureDefaultsAreSet().then(applySettingsToDom);
  });
});


// function YNABEnhanced() {
//   kango.ui.browserButton.setPopup({
//     url: 'popup/popup.html',
//     width: 330,
//     height: 260
//   });
// }

// YNABEnhanced.prototype = {
//   checkForUpdatesInBackground: function () {
//     // Chrome doesn't auto update for everyone. Let's check and make sure
//     // we're on the latest every 10 mins or so.
//     if (kango.browser.getName() === 'chrome') {
//       chrome.runtime.onUpdateAvailable.addListener(function (details) {
//         console.log('updating to version ' + details.version);
//         chrome.runtime.reload();
//       });

//       setInterval(function () {
//         console.log('Checking for update');

//         chrome.runtime.requestUpdateCheck(function (status) {
//           if (status === 'update_available') {
//             console.log('update pending...');
//           } else if (status === 'no_update') {
//             console.log('no update found');
//           } else if (status === 'throttled') {
//             console.log("I'm asking too frequently - I need to back off.");
//           }
//         });
//       }, 3600000);
//     }
//   },
//   fixContentSecurityPolicyHeaders: function () {
//     if (kango.browser.getName() === 'firefox') {
//       // Firefox enforces CSP headers in such a way that it breaks loading
//       // all of our bundled source files. Chrome's extension API doesn't do this,
//       // so it's not necessary there, but on Firefox we need to intercept HTTP
//       // requests and manipulate their CSP headers to add our extension to the
//       // allowed places scripts can be loaded from so the Toolkit will work.
//       const extensionUri = kango.io.getResourceUrl();

//       const { classes, interfaces } = Components;
//       const service = classes['@mozilla.org/observer-service;1'].getService(interfaces.nsIObserverService);

//       const overrideCSP = (cspRules) => {
//         const rules = cspRules.split(';');
//         let scriptSrcDefined = false;
//         let defaultSrcIndex = -1;

//         for (let i = 0; i < rules.length; i++) {
//           if (rules[i].toLowerCase().indexOf('script-src') >= 0) {
//             rules[i] += ` ${extensionUri} 'unsafe-inline'`;
//             scriptSrcDefined = true;
//           }

//           if (rules[i].toLowerCase().indexOf('default-src') >= 0) {
//             defaultSrcIndex = i;
//           }
//         }

//         // Some sites will put everything in the default (default-src) directive,
//         // without defining script-src. We need to modify those as well.
//         if ((!scriptSrcDefined) && (defaultSrcIndex !== -1)) {
//           rules[defaultSrcIndex] += ` ${extensionUri} 'unsafe-inline'`;
//         }

//         return rules.join(';');
//       };

//       const onHttpRequest = (subject) => {
//         // eslint-disable-next-line new-cap
//         var httpChannel = subject.QueryInterface(interfaces.nsIHttpChannel);

//         // We don't care about unsuccessful requests.
//         if (httpChannel.responseStatus !== 200) return;

//         // We don't care about requests for a host that we don't operate on.
//         if (httpChannel.originalURI.host !== 'app.youneedabudget.com') return;

//         // There is unfortunately no clean way to check the presence of csp header. An exception
//         // will be thrown if it is not there, hence the try catch malarky.
//         // https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIHttpChannel
//         try {
//           const cspRules = httpChannel.getResponseHeader('Content-Security-Policy');
//           httpChannel.setResponseHeader('Content-Security-Policy', overrideCSP(cspRules), false);
//         } catch (error) {
//           try {
//             // Fallback mechanism support for X-Content-Security-Policy header.
//             const cspRules = httpChannel.getResponseHeader('X-Content-Security-Policy');
//             httpChannel.setResponseHeader('X-Content-Security-Policy', overrideCSP(cspRules), false);
//           } catch (_) {
//             // no csp headers defined, we have nothing to do.
//             return;
//           }
//         }
//       };

//       service.addObserver(onHttpRequest, 'http-on-examine-response', false);
//     }
//   }
// };

// var extension = new YNABEnhanced();

// extension.checkForUpdatesInBackground();
// extension.fixContentSecurityPolicyHeaders();
