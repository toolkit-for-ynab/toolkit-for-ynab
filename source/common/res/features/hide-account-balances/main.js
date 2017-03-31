(function poll() {
	if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
		ynabToolKit.hideAccountBalancesFeature = (function(){
			// Supporting functions or variables.
		
			return {
				invoke() {
					// Does nothing for now.
					// Action is to delete or hide nav-account-value for either.
				}
      
				observe(changedNodes) {
					// Does nothing for now.
					// Should perform any actions related to changed nodes.
					// Need to monitor nav-accounts when active
					// Need to monitor nav-account-block when looking for type
					// Need to monitor nav-account-row when looking for indiv accounts
					//ynabToolKit.hideAccountBalancesFeature.invoke();
				}
			}
		});
		
		ynabToolKit.hideAccountBalancesFeature.invoke(); // Run on load.
	}
	else {
		setTimeout(poll, 250);
	}
}());
