	
(function poll() {
	if ( typeof ynabToolKit !== "undefined" && ynabToolKit.actOnChangeInit === true ) {

		ynabToolKit.highlightNegativesNegative = function ()  {
	   		
			var availableBalances = $('.budget-table-cell-available-div.user-data');
			var categoryBalance = {};
	
			$(availableBalances).each(function () {
				categoryBalance = $(this).find('.user-data.currency').html(); // get the value
			  	categoryBalance = Number( categoryBalance.replace(/[^\d.-]/g, '') ); // force data type as number
			  	
			
				if ( categoryBalance < 0 ) {
					
				    if ( $(this).find('.user-data.currency').hasClass('cautious') ) {
				    	$(this).find('.user-data.currency').removeClass('cautious').addClass('negative') 
				    };
				};
	
			});
	
		};
		ynabToolKit.highlightNegativesNegative(); // call itself once
		
	} else {
		setTimeout(poll, 250);
	}		
})();

