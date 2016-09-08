(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.accountsRowHeight = (function () {
      return {
        invoke: function invoke() {
          // Add our class so our CSS can take effect.
          $('.ynab-grid-body-row-top > .ynab-grid-cell').addClass('toolkit-ynab-grid-cell');
        },

        observe: function invoke(changedNodes) {
          if (changedNodes.has('ynab-grid-body')) {
            ynabToolKit.accountsRowHeight.invoke();
          }
        }
      };
    }()); // Keep feature functions contained within this object

    // Run once on page load.
    ynabToolKit.accountsRowHeight.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
