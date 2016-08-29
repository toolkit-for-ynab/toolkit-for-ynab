(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.reconciledTextColor = (function () {
      // Supporting functions,
      // or variables, etc

      return {
        invoke() {
          var transactionRows = $('.ynab-grid-body-row');
          var previousReconciled = false;
          $(transactionRows).each(function () {
            var clearedField = $(this).find('.ynab-grid-cell-cleared>i').first();
            var isReconciled = clearedField.hasClass('is-reconciled');
            var isChecked = $(this).hasClass('is-checked');

            if (isReconciled && !isChecked) {
              $(this).addClass('is-reconciled-row');
            }

            if ($(this).hasClass('ynab-grid-body-sub') && previousReconciled && !isChecked) {
              $(this).addClass('is-reconciled-row');
              isReconciled = true;
            }

            // if a sub-transaction was already marked as reconciled, then the above statement
            // would not catch it. Do this to catch the sub transactions
            if (isChecked) {
              $(this).removeClass('is-reconciled-row');
            }

            previousReconciled = isReconciled;
          });
        },

        observe(changedNodes) {
          if (changedNodes.has('ynab-grid-body') || changedNodes.has('ynab-grid-body-row ynab-grid-body-parent')) {
            // We found Account transactions rows
            ynabToolKit.reconciledTextColor.invoke();
          }
        }
      };
    }()); // Keep feature functions contained within this object

    ynabToolKit.reconciledTextColor.invoke(); // run once on page load
  } else {
    setTimeout(poll, 250);
  }
}());
