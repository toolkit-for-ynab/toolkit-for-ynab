(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageRead === true) {
    
    function exportData () {
    }
    
    return {
      invoke() {
        // Does nothing for now.
        // Should perform any setup.
      }
      
      observe(changedNodes) {
        // Does nothing for now.
        // Should perform any actions related to changed nodes.
	      // Need to monitor nav-accounts when active
	      // Need to monitor nav-account-block when looking for type
	      // Need to monitor nav-account-row when looking for indiv accounts
	      // Action is to delete or hide nav-account-value for either.
      }
      
      // Functions accessible from elsewhere.
    }
  }
  else {
    setTimeout(poll, 250);
  }
}());
