(function poll() {
  if ( typeof ynabToolKit !== "undefined" && ynabToolKit.pageReady === true ) {
  
    // When this is true, the feature scripts will know they can use the mutationObserver
    ynabToolKit.actOnChangeInit = {};

    // Set 'ynabToolKit.debugNodes = true' to print changes the mutationObserver sees
    // during page interactions and updates to the developer tools console.
    ynabToolKit.debugNodes = false;

    ynabToolKit.actOnChange = function() {
  
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
  
                if ( ynabToolKit.featureOptions.moveMoneyAutoComplete ) {       
                  ynabToolKit.moveMoneyAutoComplete();
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
      
      ynabToolKit.actOnChangeInit = true;
    };
    ynabToolKit.actOnChange(); // Call itself once

  } else {
    setTimeout(poll, 250);
  }   
})();
