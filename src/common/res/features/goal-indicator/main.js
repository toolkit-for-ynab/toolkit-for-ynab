(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== 'undefined'  && ynabToolKit.pageReady === true ) {

    ynabToolKit.goalIndicator = (function(){

	  function clearIndicators() {
	  	$('.toolkit-goalindicator').remove();
	  }
	  
      function addIndicator (element, indicator, tooltip) {
    
    	$(element).each(function(index) {
    	
    		// set alternate position if necessary, to show both goal and upcoming indicators
    		var alt = '';
    		if ($(this).hasClass('toolkit-row-goal') && (indicator == 'U')) {
    			alt = 'alt';
    		}
    		
    		var budgetedCell = $(this).find('.budget-table-cell-budgeted');
    		budgetedCell.prepend($('<div>', { class: 'toolkit-goalindicator ' + alt, title: tooltip }).append(indicator));
    	});
      }

      return {
      
        invoke: function() {
          clearIndicators();
		  addIndicator('.toolkit-row-goalTB', 'T', 'Target balance goal');
		  addIndicator('.toolkit-row-goalTBD', 'T', 'Target balance goal');
		  addIndicator('.toolkit-row-goalMF', 'M', 'Monthly budgeting or Target by date goal');
		  addIndicator('.toolkit-row-upcoming', 'U', 'Upcoming transactions')	;		
        },

        observe: function(changedNodes) {
        }
        
      };
    })(); // Keep feature functions contained within this object

	// feature called and invoked based on the budget-category-info shared feature

  } else {
    setTimeout(poll, 250);
  }
})();