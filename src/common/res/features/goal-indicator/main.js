(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== 'undefined'  && ynabToolKit.pageReady === true ) {

    ynabToolKit.goalIndicator = (function(){

	  function clearIndicators() {
	  	$('.toolkit-goalindicator').remove();
	  }
	  
      function addIndicator (element, indicator, tooltip) {
        var budgetedCell = $(element).find('.budget-table-cell-budgeted');
        budgetedCell.prepend($('<div>', { class: 'toolkit-goalindicator', title: tooltip }).append(indicator));
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