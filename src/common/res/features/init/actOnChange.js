window.ynabToolKit = new function() {
	
	this.debugNodes = false,
	
	this.featureOptions = {},
		
	// setting up a single mutationObserver that can be called by each feature
	this.actOnChange = function() {

		MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

		var observer = new MutationObserver(function(mutations, observer) {
			// Loop through all the mutations and nodes to see if navigation area was added
			
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

					
						// Changes are detected in the credit balance master category
						if ($node.hasClass("budget-table-cell-available-div")) {
							
							if ( ynabToolKit.featureOptions.checkCreditBalances ){
								ynabToolKit.checkCreditBalances();
							}
							if ( ynabToolKit.featureOptions.highlightNegativesNegative ){
								ynabToolKit.highlightNegativesNegative();
							}
							
						} else
						
						// Maybe we find the screen containing the account balances again
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
								ynabToolKit.removeZeroCategories(); // do something
							}
						}				

				}); // each node mutation event

			}); // each mutation event
			
			if (ynabToolKit.debugNodes) {
				console.log('###')
			}
			
		});

		observer.observe($('.ember-view.layout')[0], {
			subtree : true,
			childList : true,
			characterData : true,
			attributeFilter : [ 'class' ]
		});
	};

	
}; // end new ynabToolKit function

(function poll() {
    if (typeof Em !== 'undefined' && typeof Ember !== 'undefined' 
          && typeof $ !== 'undefined' && $('.ember-view.layout').length) {
    	
    	// Run each activated feature once once the DOM is ready
    	if ( ynabToolKit.featureOptions.checkCreditBalances ) {
    	  ynabToolKit.checkCreditBalances(); // check initial state of credit balances
    	}
    	
    	if ( ynabToolKit.featureOptions.highlightNegativesNegative ){
    		ynabToolKit.highlightNegativesNegative(); // set consistent colour for all negative balances
    	}
    	
    	// initialize the mutation observer so we don't need to use setTimeout()
        ynabToolKit.actOnChange(); 
    } else {
       setTimeout(poll, 250);
    }
 })();

