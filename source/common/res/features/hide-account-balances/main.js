(function poll() {
	if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
		ynabToolKit.hideAccountBalancesFeature = (function(){
			// Supporting functions or variables.
			// Note: May want to use jquery's .hide function and follow the example of "import-notification"
			var nodes;
		
			return {
				invoke() {
					// Does nothing for now.
					// Action is to delete or hide nav-account-value for either.

					// Need to monitor nav-account-block when looking for type
					// Need to monitor nav-account-row when looking for indiv accounts
					
					if (hideAccountTypeTotals && nodes.has('nav-account-block')) {
						// Hide type balance
					}
					
					if (hideAccountTotals && nodes.has('nav-account-row')) {
						// Hide account balance.
					}
				}
      
				observe(changedNodes) {
					if (changedNodes.has('nav-accounts')) {
						nodes = changedNodes;
						ynabToolKit.hideAccountBalancesFeature.invoke();
					}
					// Does nothing for now.
					// Should perform any actions related to changed nodes.
					// Need to monitor nav-accounts when active
				}
			}
		});
		
		ynabToolKit.hideAccountBalancesFeature.invoke(); // Run on load.
	}
	else {
		setTimeout(poll, 250);
	}
}());
