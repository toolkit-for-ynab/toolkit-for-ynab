(function poll() {
  if (ynabToolKit.pageReady === true && typeof ynabToolKit.shared.feedChanges !== 'undefined') {

    // When this is true, the feature scripts will know they can use the mutationObserver
    ynabToolKit.actOnChangeInit = {};

    // Set 'ynabToolKit.debugNodes = true' to print changes the mutationObserver sees
    // during page interactions and updates to the developer tools console.
    ynabToolKit.debugNodes = true;

    ynabToolKit.actOnChange = function() {

      MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

      var observer = new MutationObserver(function(mutations, observer) {

        if (ynabToolKit.debugNodes) {
          console.log('MODIFIED NODES');
        }

        ynabToolKit.changedNodes = new Set();

        mutations.forEach(function(mutation) {
          var newNodes = mutation.target;

          var $nodes = $(newNodes); // jQuery set
          $nodes.each(function() {
            var $node = $(this);

            try {
              if ( typeof $node[0].className !== 'undefined' ) {
                nodeClasses = new Set($node[0].className.split(' '));
              }
            }
            catch (err) {
              console.log(err);
            }
            ynabToolKit.changedNodes = new Set([...ynabToolKit.changedNodes, ...nodeClasses]);

          }); // each node mutation event

          if (ynabToolKit.debugNodes) {
            // console.log(newNodes);
            console.log(ynabToolKit.changedNodes);
          }

        }); // each mutation event

        if (ynabToolKit.debugNodes) {
          console.log('###');
        }

        // Calendar modal
        if (ynabToolKit.changedNodes.has('modal-calendar')) {
          ynabToolKit.l10n.localize.calendarModal();
        }

        // Budget header
        if (ynabToolKit.changedNodes.has('budget-header')) {
          ynabToolKit.l10n.localize.budgetHeader();
        }

        // Budget table
        if (ynabToolKit.changedNodes.has('budget-table')) {
          ynabToolKit.l10n.localize.budgetTable();
        }

        // Add master category modal
        if (ynabToolKit.changedNodes.has('modal-add-master-category')) {
          ynabToolKit.l10n.localize.addCategoryGroupModal();
        }

        // Add sub category modal
        if (ynabToolKit.changedNodes.has('modal-add-sub-category')) {
          ynabToolKit.l10n.localize.addCategoryModal();
        }

        // Hidden categories modal
        if (ynabToolKit.changedNodes.has('modal-budget-hidden-categories')) {
          ynabToolKit.l10n.localize.hiddenCategoriesModal();
        }

        // Hidden categories modal
        if (ynabToolKit.changedNodes.has('modal-budget-edit-category')) {
          ynabToolKit.l10n.localize.editCategoryModal();
        }

        // Inspector goals
        if (ynabToolKit.changedNodes.has('budget-inspector-goals')) {
          ynabToolKit.l10n.localize.inspector();
        }

        // Inspector goals checked
        if (ynabToolKit.changedNodes.has('is-checked')) {
          ynabToolKit.l10n.localize.inspector();
        }

        // Changes are detected in the category balances
        if (ynabToolKit.changedNodes.has('budget-table-cell-available-div')) {
          if ( ynabToolKit.options.checkCreditBalances ||  ynabToolKit.options.highlightNegativesNegative ) {
              ynabToolKit.updateInspectorColours();
          }
        }

        // The user has switched screens
        if (ynabToolKit.changedNodes.has('layout')) {
          if ( ynabToolKit.options.resizeInspector ){
            ynabToolKit.resizeInspector();
          }
        }

        // The user has returned back to the budget screen
        if (ynabToolKit.changedNodes.has('navlink-budget') && ynabToolKit.changedNodes.has('active')) {

          if ( ynabToolKit.options.budgetProgressBars ){
            ynabToolKit.budgetProgressBars();
          }
          if ( ynabToolKit.options.goalIndicator ){
            ynabToolKit.goalIndicator();
          }
          if ( ynabToolKit.options.warnOnQuickBudget ){
            ynabToolKit.warnOnQuickBudget();
          }

          ynabToolKit.l10n.localize.budgetHeader();
          ynabToolKit.l10n.localize.budgetTable();

        }

        // We found a modal pop-up
        if (ynabToolKit.changedNodes.has('options-shown')) {

          if (ynabToolKit.options.removeZeroCategories) {
            ynabToolKit.removeZeroCategories();
          }
          if (ynabToolKit.options.moveMoneyAutocomplete) {
            ynabToolKit.moveMoneyAutocomplete();
          }

        }

        // User has selected a specific sub-category
        if (ynabToolKit.changedNodes.has('is-sub-category') && ynabToolKit.changedNodes.has('is-checked')) {

          if ( ynabToolKit.options.checkCreditBalances ||  ynabToolKit.options.highlightNegativesNegative ) {
            ynabToolKit.updateInspectorColours();
          }

        }

        // The user has changed their budget row selection
        if (ynabToolKit.changedNodes.has('budget-inspector')) {

          if ( ynabToolKit.options.warnOnQuickBudget ){
            ynabToolKit.warnOnQuickBudget();
          }
          if ( ynabToolKit.options.checkCreditBalances ){
              ynabToolKit.checkCreditBalances();
          }
          if ( ynabToolKit.options.highlightNegativesNegative ){
            ynabToolKit.highlightNegativesNegative();
          }

          ynabToolKit.l10n.localize.inspector();

        }

        // Now we are ready to feed the change digest to the
        // automatically setup feedChanges file/function
        ynabToolKit.shared.feedChanges(ynabToolKit.changedNodes);

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
