(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.showIntercom = (function () {
      return {
        invoke() {

        },

        onRouteChanged(currentRoute) {
          if (currentRoute.indexOf('account') !== -1) {
            console.log('leggo');
          }
        }
      };
    }()); // Keep feature functions contained within this object
  } else {
    setTimeout(poll, 250);
  }
}());
