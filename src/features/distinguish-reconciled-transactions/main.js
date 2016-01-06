(function addIsReconciledClassForRows() {
   
  if ( typeof Em !== 'undefined' && typeof Ember !== 'undefined' && typeof $ !== 'undefined' ) {
    
    var transactionRows = $('.ynab-grid-body-row');
    $(transactionRows).each(function(i) {
      clearedField = $(this).find(".ynab-grid-cell-cleared>i").first();
      if (clearedField.hasClass("is-reconciled")) {
        $(this).addClass("is-reconciled-row");
      }
    })
  }
  setTimeout(addIsReconciledClassForRows, 300);

})();
