(function poll() {
  if (ynabToolKit.pageReady === true && typeof ynabToolKit.shared.feedChanges !== 'undefined') {

    // When this is true, the feature scripts will know they can use the mutationObserver
    ynabToolKit.actOnChangeInit = {};

    // Set 'ynabToolKit.debugNodes = true' to print changes the mutationObserver sees
    // during page interactions and updates to the developer tools console.
    ynabToolKit.debugNodes = false;

    ynabToolKit.actOnChange = function() {

      MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

      var observer = new MutationObserver(function(mutations, observer) {

        if (ynabToolKit.debugNodes) {
          console.log('MODIFIED NODES');
        }

        mutations.forEach(function(mutation) {
          var newNodes = mutation.target;
          if (ynabToolKit.debugNodes) {
            console.log(newNodes);
          }

          var $nodes = $(newNodes); // jQuery set
          $nodes.each(function() {
            var $node = $(this);

            nodeClasses = new Set($node[0].className.split(' '));
            ynabToolKit.observedNodes = new Set([...ynabToolKit.observedNodes, ...nodeClasses]);

          }); // each node mutation event

        }); // each mutation event

        if (ynabToolKit.debugNodes) {
          console.log('###')
        }

        // Changes are detected in the category balances
        if (ynabToolKit.observedNodes.has('budget-table-cell-available-div')) {
          if ( ynabToolKit.options.checkCreditBalances ||  ynabToolKit.options.highlightNegativesNegative ) {
              ynabToolKit.updateInspectorColours();
          }
        }
        
        // The user has switched screens
        if (ynabToolKit.observedNodes.has('layout')) {
          if ( ynabToolKit.options.resizeInspector ){
            ynabToolKit.resizeInspector();
          }
        }

        // The user has returned back to the budget screen
        if (ynabToolKit.observedNodes.has('navlink-budget') && ynabToolKit.observedNodes.has('active')) {
        
          if ( ynabToolKit.options.budgetProgressBars ){
            ynabToolKit.budgetProgressBars();
          }
          if ( ynabToolKit.options.goalIndicator ){
            ynabToolKit.goalIndicator();
          }
          if ( ynabToolKit.options.warnOnQuickBudget ){
            ynabToolKit.warnOnQuickBudget();
          }

        }

        // We found a modal pop-up
        if (ynabToolKit.observedNodes.has('options-shown')) {

          if (ynabToolKit.options.removeZeroCategories) {
            ynabToolKit.removeZeroCategories();
          }
          if (ynabToolKit.options.moveMoneyAutocomplete) {
            ynabToolKit.moveMoneyAutocomplete();
          }

        }

        // User has selected a specific sub-category
        if (ynabToolKit.observedNodes.has('is-sub-category') && ynabToolKit.observedNodes.has('is-checked')) {

          if ( ynabToolKit.options.checkCreditBalances ||  ynabToolKit.options.highlightNegativesNegative ) {
            ynabToolKit.updateInspectorColours();
          }

        }


        // We found Account transactions rows
        if (ynabToolKit.observedNodes.has('ynab-grid-body')) {

          if (ynabToolKit.options.swapClearedFlagged) {
            ynabToolKit.swapClearedFlagged();
          }

        }

        // The user has changed their budget row selection
        if (ynabToolKit.observedNodes.has('budget-inspector')) {

          if ( ynabToolKit.options.warnOnQuickBudget ){
            ynabToolKit.warnOnQuickBudget();
          }
          if ( ynabToolKit.options.checkCreditBalances ){
              ynabToolKit.checkCreditBalances();
          }
          if ( ynabToolKit.options.highlightNegativesNegative ){
            ynabToolKit.highlightNegativesNegative();
          }

        }

        // Now we are ready to feed the change digest to the
        // automatically setup feedChanges file/function
        ynabToolKit.shared.feedChanges(ynabToolKit.observedNodes);

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
    ynabToolKit.actOnChange(); // Run itself once

  } else {
    setTimeout(poll, 250);
  }
})();
