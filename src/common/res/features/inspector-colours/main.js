(function poll() {
  if ( typeof ynabToolKit !== "undefined" && ynabToolKit.actOnChangeInit === true ) {

    ynabToolKit.updateInspectorColours = new function ()  {

      this.invoke = function() {
        if ( !$('.budget-inspector-multiple').length ) {

          var selectedSubCat = $('.budget-table-row.is-sub-category.is-checked')
          .find('.budget-table-cell-available-div span.currency')[0]
          var inspectorAvailableText = $('.inspector-overview-available').find('dt');
          var inspectorAvailableFunds = $('.inspector-overview-available').find('span');
          if (!$(selectedSubCat).hasClass('positive')) {
            $(inspectorAvailableText).attr("class", $(selectedSubCat).attr("class")).removeClass('currency');
          }
          $(inspectorAvailableFunds).attr("class", $(selectedSubCat).attr("class"));

        }
      },

      this.observe = function(changedNodes) {

        if (changedNodes.has('budget-table-cell-available-div')) {
          // Changes are detected in the category balances
          ynabToolKit.updateInspectorColours.invoke();
        } else

        if (ynabToolKit.changedNodes.has('is-sub-category') && ynabToolKit.changedNodes.has('is-checked')) {
          // User has selected a specific sub-category
          ynabToolKit.updateInspectorColours.invoke();
        }

      };

    };
    ynabToolKit.updateInspectorColours.invoke();

  } else {
    setTimeout(poll, 250);
  }
})();