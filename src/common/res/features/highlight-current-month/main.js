(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.currentMonthIndicator = new function ()  { // Keep feature functions contained within this
      
      this.invoke = function() {
      
      	// find current month and year
      	var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      	var d = new Date();
      	var month = monthNames[d.getMonth()];
      	var year = d.getFullYear();
      	
      	// check if header bar is current month, if so, change background color
		if ( $('button.budget-header-calendar-date-button').text().trim() == month + ' ' + year) {
			$('.budget-header .budget-header-item').css('background-color', '#00596f');
		}
		else {
			$('.budget-header .budget-header-item').css('background-color', '#003540');		
		}
      },
      
      this.observe = function(changedNodes) {
  
          if (changedNodes.has('budget-header')) {
            ynabToolKit.currentMonthIndicator.invoke();
          }
        };

    }; // Keep feature functions contained within this
    ynabToolKit.currentMonthIndicator.invoke(); // Run once and activate setTimeOut()

  } else {
    setTimeout(poll, 250);
  }
})();