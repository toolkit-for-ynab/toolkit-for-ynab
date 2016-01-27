(function addIsReconciledClassForRows() {
   
  if ( typeof Em !== 'undefined' && typeof Ember !== 'undefined' && typeof $ !== 'undefined' ) {
    
    var transactionRows = $('.ynab-grid-body-row');
    var previousReconciled = false;
    $(transactionRows).each(function(i) {
      clearedField = $(this).find(".ynab-grid-cell-cleared>i").first();
      isReconciled = clearedField.hasClass("is-reconciled");
      if (isReconciled) {
        $(this).addClass("is-reconciled-row");
      }
      if ($(this).hasClass("ynab-grid-body-sub") && previousReconciled) {
        $(this).addClass("is-reconciled-row");
        isReconciled = true;
      }
      previousReconciled = isReconciled;
    })
  }
  setTimeout(addIsReconciledClassForRows, 300);

})();
