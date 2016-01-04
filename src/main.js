function injectCSS(path) {
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', chrome.extension.getURL(path));

  document.getElementsByTagName('head')[0].appendChild(link);
}

function injectScript(path) {
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', chrome.extension.getURL(path));

  document.getElementsByTagName('body')[0].appendChild(script);
}

chrome.storage.sync.get({
  collapseSideMenu: true,
  colourBlindMode: false,
  hideAOM: false,
  enableRetroCalculator: true
}, function(options) {

  if (options.collapseSideMenu) {
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.extension.getURL('features/collapse-side-menu/main.js'));

    document.getElementsByTagName('body')[0].appendChild(script);
  }

  if (options.colourBlindMode) {
    injectCSS('features/colour-blind-mode/main.css');
  }

  if (options.hideAOM) {
    injectCSS('features/hide-age-of-money/main.css');
  }

  if (options.enableRetroCalculator) {
    injectScript('features/ynab-4-calculator/main.js');
  }

});
