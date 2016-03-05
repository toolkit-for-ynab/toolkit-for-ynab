(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.reconciledTextColor = (function(){

      // Supporting functions,
      // or variables, etc

      return {
        invoke: function() {
          var transactionRows = $('.ynab-grid-body-row');
          var previousReconciled = false;
          $(transactionRows).each(function(i) {
            clearedField = $(this).find(".ynab-grid-cell-cleared>i").first();
            isReconciled = clearedField.hasClass("is-reconciled");
            if (isReconciled) {
              $(this).addClass("is-reconciled-row");
            }
            if ($(this).hasClass("ynab-grid-body-sub") && previousReconciled) {
              $(this).addClass("is-reconciled-row");
              isReconciled = true;
            }
            previousReconciled = isReconciled;
          });
        },

        observe: function(changedNodes) {
          if (changedNodes.has('ynab-grid-body')) {
            // We found Account transactions rows
            ynabToolKit.reconciledTextColor.invoke();
          }
        }
      };
    })(); // Keep feature functions contained within this object

    ynabToolKit.reconciledTextColor.invoke(); // run once on page load

  } else {
    setTimeout(poll, 250);
  }
})();
