
(function poll() {

  if ( typeof ynabToolKit !== "undefined" && ynabToolKit.pageReady === true) {

    ynabToolKit.removeZeroCategories = new function ()  {

      this.invoke = function() {
        var coverOverbudgetingCategories = $( ".modal-budget-overspending .options-shown .ynab-select-options" ).children('li:not(:first-child)');
        coverOverbudgetingCategories.each(function(i) {
          var t = $(this).text(); // Category balance text.
          var categoryBalance = parseInt(t.substr(t.indexOf(":"), t.length).replace(/[^\d-]/g, ''));
          if ($(this).hasClass('is-selectable') && categoryBalance <= 0) {
            $(this).remove();
          }
        });
      },

      this.observe = function(changedNodes) {

      if (changedNodes.has('ynab-select user-data options-shown')) {
          // We found a modal pop-up
          ynabToolKit.removeZeroCategories.invoke();
        }
      };

    };
    ynabToolKit.removeZeroCategories.invoke(); // Run itself once

  } else {
    setTimeout(poll, 250);
  }
})();
