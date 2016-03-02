(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {
    ynabToolKit.currentMonthIndicator = (function(){
      return {
        invoke: function() {
          // find current month and year
          var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          var d = new Date();
          var currentDate = monthNames[d.getMonth()] + ' 01 ' + d.getFullYear();

          // get month and year from YNAB
          var ynabDate = String(ynabToolKit.shared.parseSelectedMonth());
          ynabDate = ynabDate.substring(4, 15); // trim day of week

          // check if header bar is current month, if so, change background color
          if ( ynabDate == currentDate) {
            $('.budget-header .budget-header-calendar').addClass('toolkit-highlight-current-month');
          }
          else {
            $('.budget-header .budget-header-calendar').removeClass('toolkit-highlight-current-month');
          }
        },

        observe: function(changedNodes) {
          if (changedNodes.has('budget-header-totals-cell-value user-data') ||
          	  changedNodes.has('budget-content resizable') ||
              changedNodes.has('pure-g layout user-logged-in')) {
            ynabToolKit.currentMonthIndicator.invoke();
          }
        }
      };
    })(); // Keep feature functions contained within this object

    ynabToolKit.currentMonthIndicator.invoke(); // Run once and activate setTimeOut()

  } else {
    setTimeout(poll, 250);
  }
})();
