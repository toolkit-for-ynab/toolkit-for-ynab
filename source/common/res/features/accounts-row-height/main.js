(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    let compactHeight = 27;
    let slimHeight = 22;

    ynabToolKit.accountsRowHeight = (function () {
      return {
        invoke: function invoke() {
          // If the activity-transaction-link feature is not active we don't want to adjust the
          // record height because doing so causes scrolling to be jumpier than usual. If the
          // activity-transaction-link feature is active we do need to set the record height
          // because it uses the value to scroll the "selected transaction" to the top of the
          // register.
          if (ynabToolKit.options.activityTransactionLink) {
            let ynabGridContainer = ynabToolKit.shared.getEmberView($('.ynab-grid-container').attr('id'));

            // Will be undefined when YNAB is loaded going directly to the budget screen.
            if (typeof ynabGridContainer !== 'undefined') {
              let recordHeight = ynabGridContainer.get('recordHeight');

              // The second check is to minimize the times that recordHeight is changed because
              // each time it's changed YNAB reacts to it and that contributes to the scrolling
              // jumpyness.
              if (ynabToolKit.options.accountsRowHeight === '1' && recordHeight !== compactHeight) {
                ynabGridContainer.set('recordHeight', compactHeight);
              } else if (ynabToolKit.options.accountsRowHeight === '2' && recordHeight !== slimHeight) {
                ynabGridContainer.set('recordHeight', slimHeight);
              }
            }

            // Add our class so our CSS can take effect.
            $('.ynab-grid-body-row-top > .ynab-grid-cell').addClass('toolkit-ynab-grid-cell');
          }
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
