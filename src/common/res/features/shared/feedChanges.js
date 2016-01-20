(function poll() {

  if (typeof ynabToolKit.shared !== 'undefined') {

    ynabToolKit.shared.feedChanges = function(digest) {

      // Python script auto builds up this list of features
      // that will use the mutation observer from actOnChange();

      if ( ynabToolKit.insertPacingColumns ){
        ynabToolKit.insertPacingColumns.observe(digest);
      }

    };

  } else {
    setTimeout(poll, 100);
  }
})();
