(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.squareNegativeMode = (function(){

      return {
        invoke: function() {
        
        	// look in budget, inspector, and pacing columns
        	$.each($('.budget-table .currency, .budget-inspector .currency, .budget-table-cell-pacing .cautious'), function(key, val) {
        		
        		var num = $(this).text();
        		if (parseInt(num.replace('$', '')) < 0 )
        		{
        			$(this).addClass('negative');
        		}
        		else {
        			$(this).removeClass('negative');
        		}
        	});
        },

        observe: function(changedNodes) {
        
          // look for changes to budgeting cells
          if (changedNodes.has('budget-table-row is-sub-category') || changedNotes.has('budget-table-row is-master-category')) {
            ynabToolKit.squareNegativeMode.invoke();
          }
        }
        
      };
    })(); // Keep feature functions contained within this object

	// run on load if in budgeting section
	if (/budget/.test(window.location.href)) {
	  ynabToolKit.squareNegativeMode.invoke();
	}
  } else {
    setTimeout(poll, 250);
  }
})();
