window.ynabToolKit = new function() {
	
	// Set 'ynabToolKit.debugNodes = true' to print changes the mutationObserver sees
	// during page interactions and updates to the developer tools console.
	this.debugNodes = false,

	// This variable is populated by each active script loaded inside the ynabToolKit object
	this.featureOptions = {},

	// Setting up a single mutationObserver that can be called by each feature
	this.actOnChange = function() {

		MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

		var observer = new MutationObserver(function(mutations, observer) {

			if (ynabToolKit.debugNodes) {
				console.log('NEW NODES');
			}

			mutations.forEach(function(mutation) {
				var newNodes = mutation.target;
				if (ynabToolKit.debugNodes) {
					console.log(newNodes);
				}

				var $nodes = $(newNodes); // jQuery set
				$nodes.each(function() {
					var $node = $(this);


						// Changes are detected in the category balances
						if ($node.hasClass("budget-table-cell-available-div")) {

							if ( ynabToolKit.featureOptions.checkCreditBalances ){
								ynabToolKit.checkCreditBalances();
							}
							if ( ynabToolKit.featureOptions.highlightNegativesNegative ){
								ynabToolKit.highlightNegativesNegative();
							}

						} else

						// The user has returned back to the budget screen
						if ($node.hasClass('budget-table-row')) {

							if ( ynabToolKit.featureOptions.checkCreditBalances ){
								ynabToolKit.checkCreditBalances();
							}
							if ( ynabToolKit.featureOptions.highlightNegativesNegative ){
								ynabToolKit.highlightNegativesNegative();
							}
						}

						// We found a modal pop-up
						if ($node.hasClass( "options-shown")) {

							if ( ynabToolKit.featureOptions.removeZeroCategories ) {
								ynabToolKit.removeZeroCategories();
							}
						}

				}); // each node mutation event

			}); // each mutation event

			if (ynabToolKit.debugNodes) {
				console.log('###')
			}

		});

		// This finally says 'Watch for changes' and only needs to be called the one time
		observer.observe($('.ember-view.layout')[0], {
			subtree : true,
			childList : true,
			characterData : true,
			attributeFilter : [ 'class' ]
		});
	};


}; // end ynabToolKit object

// This poll() function will only need to run until we find that the DOM is ready
// For certain functions, we may run them once automatically on page load before 'changes' occur
(function poll() {
    if (typeof Em !== 'undefined' && typeof Ember !== 'undefined'
          && typeof $ !== 'undefined' && $('.ember-view.layout').length) {


    	if ( ynabToolKit.featureOptions.checkCreditBalances ) {
    	  ynabToolKit.checkCreditBalances();
    	}

    	if ( ynabToolKit.featureOptions.highlightNegativesNegative ){
    		ynabToolKit.highlightNegativesNegative();
    	}

    	// Activate the mutationObserver so we don't need to use setTimeout() anymore
        ynabToolKit.actOnChange();
    } else {
       setTimeout(poll, 250);
    }
 })();
