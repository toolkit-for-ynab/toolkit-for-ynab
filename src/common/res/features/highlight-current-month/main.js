(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.currentMonthIndicator = new function ()  { // Keep feature functions contained within this
      
      this.invoke = function() {
      
      	// find current month and year
      	var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      	var d = new Date();
      	var currentDate = monthNames[d.getMonth()] + ' 01 ' + d.getFullYear();
      	
      	// get month and year from YNAB
      	var ynabDate = String(ynabToolKit.shared.parseSelectedMonth());
      	ynabDate = ynabDate.substring(4, 15); // trim day of week
      	
      	// check if header bar is current month, if so, change background color
		if ( ynabDate == currentDate) {
			$('.budget-header .budget-header-item').css('background-color', '#00596f');
		}
		else {
			$('.budget-header .budget-header-item').css('background-color', '#003540');		
		}
      },
      
      this.observe = function(changedNodes) {
  
          if (
          	changedNodes.has('budget-header-totals-cell-value user-data') ||
          	changedNodes.has('budget-content resizable')) {
            ynabToolKit.currentMonthIndicator.invoke();
          }
        };

    }; // Keep feature functions contained within this
    ynabToolKit.currentMonthIndicator.invoke(); // Run once and activate setTimeOut()

  } else {
    setTimeout(poll, 250);
  }
})();