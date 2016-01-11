(function highlightNegativesNegative_enhancedYNAB() { // give function unique name unlikely to be used by YNAB devs
   
	if ( typeof Em !== 'undefined' && typeof Ember !== 'undefined' && typeof $ !== 'undefined' && $('.budget-table-cell-available-div.user-data').length ) {
		
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

	}
	setTimeout(highlightNegativesNegative_enhancedYNAB, 300);

})();

