(function poll() {
  if ( typeof ynabToolKit !== "undefined" && ynabToolKit.pageReady === true ) {
  
    ynabToolKit.goalIndicatorWarningColor = (function(){
    
      return {
        invoke: function() {
        
          // look in budget, inspector
      	  $.each($('.budget-table-cell-available-div.user-data .cautious'), function(key, val) {
      		
      		var num = $(this).text();
      		if (ynab.unformat(num) >= 0)
      		{
      			$(this).addClass('toolkit-goalwarning');
      			$('dl.inspector-overview-available .cautious').addClass('toolkit-goalwarning');
      		}
      	  });
        },

        observe: function(changedNodes) {
        
          // look for changes to budgeting cells, inspector
          if (
          	changedNodes.has('navlink-budget active') || 
          	changedNodes.has('budget-inspector') ||
            changedNodes.has('budget-table-cell-available-div user-data')) {
            	ynabToolKit.goalIndicatorWarningColor.invoke();
          }
        }
        
      };
    })(); // Keep feature functions contained within this object

	// run on load if in budgeting section
	if (/budget/.test(window.location.href)) {
	  ynabToolKit.goalIndicatorWarningColor.invoke();
	}

  } else {
    setTimeout(poll, 250);
  }
})();