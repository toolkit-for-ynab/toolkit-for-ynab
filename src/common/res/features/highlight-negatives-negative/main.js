(function poll() {
  if ( typeof ynabToolKit !== "undefined" && ynabToolKit.pageReady === true ) {
  
    ynabToolKit.highlightNegativesNegative = (function(){
    
      return {
        invoke: function() {
        
          // look in budget, inspector
      	  $.each($('.budget-table-cell-available-div.user-data .cautious, .budget-inspector .cautious'), function(key, val) {
      		
      		var num = $(this).text();
      		if (ynab.unformat(num) < 0)
      		{
      			$(this).removeClass('cautious').addClass('negative');
      		}
      	  });
        },

        observe: function(changedNodes) {
        
          // look for changes to budgeting cells, inspector
          if (
            changedNodes.has('navlink-budget active') ||
            changedNodes.has('budget-table-cell-available-div user-data') ||
          	changedNodes.has('budget-inspector')) {
            ynabToolKit.highlightNegativesNegative.invoke();
          }
        }
        
      };
    })(); // Keep feature functions contained within this object

	// run on load if in budgeting section
	if (/budget/.test(window.location.href)) {
	  ynabToolKit.highlightNegativesNegative.invoke();
	}

  } else {
    setTimeout(poll, 250);
  }
})();