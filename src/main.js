chrome.storage.sync.get({
  hideAOM: false,
  enableRetroCalculator: true
}, function(options) {

  if (options.hideAOM) {
    var link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    link.setAttribute('href', chrome.extension.getURL('hideAOM.css'));

    document.getElementsByTagName('head')[0].appendChild(link);
  }

  if (options.enableRetroCalculator) {

    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', chrome.extension.getURL('ynab4calculator.js'));

    document.getElementsByTagName('body')[0].appendChild(script);
  }
});
