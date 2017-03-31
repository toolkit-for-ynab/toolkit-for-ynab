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
	      // Not sure what we need to observe and change.
      }
      
      // Functions accessible from elsewhere.
    }
  }
  else {
    setTimeout(poll, 250);
  }
}());
