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
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', chrome.extension.getURL('features/colour-blind-mode/main.css'));

    document.getElementsByTagName('head')[0].appendChild(link);
  }


  if (options.hideAOM) {
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', chrome.extension.getURL('features/hide-age-of-money/main.css'));

    document.getElementsByTagName('head')[0].appendChild(link);
  }

  if (options.enableRetroCalculator) {

    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.extension.getURL('features/ynab-4-calculator/main.js'));

    document.getElementsByTagName('body')[0].appendChild(script);
  }

});
