// ==UserScript==
// @name Main
// @include http://*.youneedabudget.com/*
// @include https://*.youneedabudget.com/*
// @require res/features/allSettings.js
// ==/UserScript==
function injectCSS(path) {
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', kango.io.getResourceUrl(path));

  document.getElementsByTagName('head')[0].appendChild(link);
}

var previouslyInjectedScripts = [];

function injectScript(path) {
  if (previouslyInjectedScripts.indexOf(path) < 0) {
    previouslyInjectedScripts.push(path);

    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', kango.io.getResourceUrl(path));

    document.getElementsByTagName('head')[0].appendChild(script);
  }
}

function injectJSString(js) {
  var script = document.createElement('script');
  script.text = js;

  document.getElementsByTagName('head')[0].appendChild(script);
}

function applySettingsToDom() {
  ynabToolKit.settings.forEach(function (setting) {
    getKangoSetting(setting.name).then(function (data) {
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
  return getKangoSetting(setting.name).then(function (data) {
    options[setting.name] = data;
  });
}

var optionsPromises = [];
ynabToolKit.settings.forEach(function (setting) {
  optionsPromises.push(pushOption(setting));
});

Promise.all(optionsPromises).then(function () {
  let version = getKangoExtensionInfo().version;

  injectJSString(`
    window.ynabToolKit = { version: '${version}'};
    ynabToolKit.options = ${JSON.stringify(options)};
    Object.freeze(ynabToolKit.options);
    Object.seal(ynabToolKit.options);
  `);

  /* Load this to setup shared utility functions */
  injectScript('res/features/shared/main.js');

  /* Global toolkit css. */
  injectCSS('res/features/shared/main.css');

  /* This script to be built automatically by the python script */
  injectScript('res/features/act-on-change/feedChanges.js');

  /* Load this to setup behaviors when the DOM updates and shared functions */
  injectScript('res/features/act-on-change/main.js');

  /* Load the ynabToolkit bundle */
  injectScript('res/features/ynabToolkit.js');

  ensureDefaultsAreSet().then(applySettingsToDom);
});
