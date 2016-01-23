(function poll() {

  if (typeof ynabToolKit.shared !== 'undefined') {

    ynabToolKit.shared.feedChanges = function(changedNodes) {

      // Python script auto builds up this list of features
      // that will use the mutation observer from actOnChange()

      // If a feature doesn't need to use observe(), we
      // just let it fail silently

      try {
        ynabToolKit.swapClearedFlagged.observe(changedNodes);
      } catch(err) {/* ignore */}

      try {
        ynabToolKit.insertPacingColumns.observe(changedNodes);
      } catch(err) {/* ignore */}

      try {
        ynabToolKit.toggleSplits.observe(changedNodes);
      } catch(err) {/* ignore */}

      try {
        ynabToolKit.updateInspectorColours.observe(changedNodes);
      } catch(err) {/* ignore */}

      try {
        ynabToolKit.resizeInspector.observe(changedNodes);
      } catch(err) {/* ignore */}

      try {
        ynabToolKit.budgetProgressBars.observe(changedNodes);
      } catch(err) {/* ignore */}

      try {
        ynabToolKit.goalIndicator.observe(changedNodes);
      } catch(err) {/* ignore */}

      try {
        ynabToolKit.warnOnQuickBudget.observe(changedNodes);
      } catch(err) {/* ignore */}

      try {
        ynabToolKit.removeZeroCategories.observe(changedNodes);
      } catch(err) {/* ignore */}

      try {
        ynabToolKit.moveMoneyAutocomplete.observe(changedNodes);
      } catch(err) {/* ignore */}

      try {
        ynabToolKit.highlightNegativesNegative.observe(changedNodes);
      } catch(err) {/* ignore */}

      try {
        ynabToolKit.checkCreditBalances.observe(changedNodes);
      } catch(err) {/* ignore */}

    };

  } else {
    setTimeout(poll, 100);
  }
})();
