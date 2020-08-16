import { Feature } from 'toolkit/extension/features/feature';

export class HideMemoCol extends Feature {
  injectCSS() {
    var styleSheet = './';
    // Edge 20+
    // When we add Edge support this may be helpful to have
    //  var isEdge = !isIE && !!window.StyleMedia;

    // Safari 3.0+ "[object HTMLElementConstructor]"
    // When we add Safari support this may be helpful to have
    //  var isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

    // Chrome 1 - 79
    // In case it is necessary to detect chrome in the future.
    //  var isChrome = !!window.chrome && (!!window.chrome.webstore || !!window.chrome.runtime);

    // Firefox 1.0+
    var isFirefox = typeof InstallTrigger !== 'undefined';

    if (isFirefox) {
      styleSheet += 'ff';
    } else {
      styleSheet += 'index';
    }

    // return require(styleSheet);
    return require(styleSheet + '.css');
  }

  shouldInvoke() {
    return false;
  }
}
