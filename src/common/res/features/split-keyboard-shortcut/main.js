(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.pageReady === true ) {

    ynabToolKit.splitKeyboardShortcut = (function(){

      return {
        invoke: function() {          
        },

        observe: function(changedNodes) {
        
        	// limit to accounts view
        	if (/accounts/.test(window.location.href)) 
        	{
	        	if (changedNodes.has('modal-list')) 
    	    	{
        			if ($('.ynab-grid-cell-subCategoryName input.accounts-text-field').val() == 'split')
    				{
    					$('button.modal-account-categories-split-transaction').mousedown();
    				}
        		}
        	}
        }
      };
      
    })(); // Keep feature functions contained within this object
    
    ynabToolKit.splitKeyboardShortcut.invoke(); // Run once and activate setTimeOut()

  } else {
    setTimeout(poll, 250);
  }
})();
