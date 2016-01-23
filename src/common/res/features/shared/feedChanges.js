(function poll() {

  if (typeof ynabToolKit.shared !== 'undefined') {

    ynabToolKit.shared.feedChanges = function(changedNodes) {

      // Python script auto builds up this list of features
      // that will use the mutation observer from actOnChange()

      if ( ynabToolKit.swapClearedFlagged ){
        ynabToolKit.swapClearedFlagged.observe(changedNodes);
      }
      if ( ynabToolKit.insertPacingColumns ){
        ynabToolKit.insertPacingColumns.observe(changedNodes);
      }
      if ( ynabToolKit.toggleSplits ){
        ynabToolKit.toggleSplits.observe(changedNodes);
      }

    };

  } else {
    setTimeout(poll, 100);
  }
})();
