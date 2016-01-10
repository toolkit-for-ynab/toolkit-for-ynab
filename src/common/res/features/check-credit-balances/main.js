(function checkCreditBalances_enhancedYNAB() { // give function unique name unlikely to be used by YNAB devs
   
	if ( typeof Em !== 'undefined' && typeof Ember !== 'undefined' && typeof $ !== 'undefined' && $('.is-debt-payment-category.is-master-category').length ) {

		var debtPaymentCategories = $('.is-debt-payment-category.is-sub-category');
		var accountName = {};
		var accountBalance = {};
		var accountMatch = {};
		
		
		$(debtPaymentCategories).each(function () {
		  accountName = $(this).find('.budget-table-cell-name div.button-truncate').prop('title')
		 
		  var categoryBalance = $(this).find('.budget-table-cell-available-div .user-data.currency').html();
		  categoryBalance = Number( categoryBalance.replace(/[^\d.-]/g, '') );
		
		  $('.nav-account-row').each(function () {
		
		    if ( $(this).find('.nav-account-name').prop('title') == accountName ) {
		      accountMatch = true;
		      accountBalance = $(this).find('.user-data.currency').html();
		      accountBalance = Number( accountBalance.replace(/[^\d.-]/g, '') );
		    }
		
		  });
		
		  if ( accountMatch ) {

		  	if ( accountBalance + categoryBalance !== 0 ) { // warn if funds do not balance to 0

		      	var $thisCategoryBalance = $(this).find('.budget-table-cell-available-div .user-data.currency')
		      	if ( $thisCategoryBalance.hasClass('positive') ) {
		      		$thisCategoryBalance.removeClass('positive').addClass('cautious');
		      	};

		  	};
		
		      accountMatch = false; // reset
		  };
		});

  	};

	setTimeout(checkCreditBalances_enhancedYNAB, 300);

})();

