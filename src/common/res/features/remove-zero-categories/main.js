	
(function poll() {
	
	if ( typeof ynabToolKit !== "undefined" && ynabToolKit.actOnChangeInit === true) {

		ynabToolKit.removeZeroCategories = function ()  {
		    var coverOverbudgetingCategories = $( ".modal-budget-overspending .options-shown .ynab-select-options" ).children('li');
		    coverOverbudgetingCategories.each(function(i) {
		      var t = $(this).text(); // Category balance text.
		      var categoryBalance = parseInt(t.substr(t.indexOf(":"), t.length).replace(/[^\d-]/g, ''));
		      if (categoryBalance <= 0) {
		        $(this).remove();
		      }
		    });
		};
		ynabToolKit.removeZeroCategories(); // Run itself once
		
	} else {
		setTimeout(poll, 250);
	}		
})();
	
	
	

	
	    
