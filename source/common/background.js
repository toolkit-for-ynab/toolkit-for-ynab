/* global Components */

function YNABEnhanced() {
  kango.ui.browserButton.setPopup({
    url: 'popup/popup.html',
    width: 330,
    height: 260
  });
}

YNABEnhanced.prototype = {
  checkForUpdatesInBackground: function () {
    // Chrome doesn't auto update for everyone. Let's check and make sure
    // we're on the latest every 10 mins or so.
    if (kango.browser.getName() === 'chrome') {
      chrome.runtime.onUpdateAvailable.addListener(function (details) {
        console.log('updating to version ' + details.version);
        chrome.runtime.reload();
      });

      setInterval(function () {
        console.log('Checking for update');

        chrome.runtime.requestUpdateCheck(function (status) {
          if (status === 'update_available') {
            console.log('update pending...');
          } else if (status === 'no_update') {
            console.log('no update found');
          } else if (status === 'throttled') {
            console.log("I'm asking too frequently - I need to back off.");
          }
        });
      }, 3600000);
    }
  },
  fixContentSecurityPolicyHeaders: function () {
    if (kango.browser.getName() === 'firefox') {
      // Firefox enforces CSP headers in such a way that it breaks loading
      // all of our bundled source files. Chrome's extension API doesn't do this,
      // so it's not necessary there, but on Firefox we need to intercept HTTP
      // requests and manipulate their CSP headers to add our extension to the
      // allowed places scripts can be loaded from so the Toolkit will work.
      const extensionUri = kango.io.getResourceUrl();

      const { classes, interfaces } = Components;
      const service = classes['@mozilla.org/observer-service;1'].getService(interfaces.nsIObserverService);

      const overrideCSP = (cspRules) => {
        const rules = cspRules.split(';');
        let scriptSrcDefined = false;
        let defaultSrcIndex = -1;

        for (let i = 0; i < rules.length; i++) {
          if (rules[i].toLowerCase().indexOf('script-src') >= 0) {
            rules[i] += ` ${extensionUri} 'unsafe-inline'`;
            scriptSrcDefined = true;
          }

          if (rules[i].toLowerCase().indexOf('default-src') >= 0) {
            defaultSrcIndex = i;
          }
        }

        // Some sites will put everything in the default (default-src) directive,
        // without defining script-src. We need to modify those as well.
        if ((!scriptSrcDefined) && (defaultSrcIndex !== -1)) {
          rules[defaultSrcIndex] += ` ${extensionUri} 'unsafe-inline'`;
        }

        return rules.join(';');
      };

      const onHttpRequest = (subject) => {
        // eslint-disable-next-line new-cap
        var httpChannel = subject.QueryInterface(interfaces.nsIHttpChannel);

        // We don't care about unsuccessful requests.
        if (httpChannel.responseStatus !== 200) return;

        // We don't care about requests for a host that we don't operate on.
        if (httpChannel.originalURI.host !== 'app.youneedabudget.com') return;

        // There is unfortunately no clean way to check the presence of csp header. An exception
        // will be thrown if it is not there, hence the try catch malarky.
        // https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsIHttpChannel
        try {
          const cspRules = httpChannel.getResponseHeader('Content-Security-Policy');
          httpChannel.setResponseHeader('Content-Security-Policy', overrideCSP(cspRules), false);
        } catch (error) {
          try {
            // Fallback mechanism support for X-Content-Security-Policy header.
            const cspRules = httpChannel.getResponseHeader('X-Content-Security-Policy');
            httpChannel.setResponseHeader('X-Content-Security-Policy', overrideCSP(cspRules), false);
          } catch (_) {
            // no csp headers defined, we have nothing to do.
            return;
          }
        }
      };

      service.addObserver(onHttpRequest, 'http-on-examine-response', false);
    }
  }
};

var extension = new YNABEnhanced();

extension.checkForUpdatesInBackground();
extension.fixContentSecurityPolicyHeaders();
