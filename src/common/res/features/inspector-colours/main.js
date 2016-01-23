(function poll() {
  if ( typeof ynabToolKit !== "undefined" && ynabToolKit.actOnChangeInit === true ) {

    ynabToolKit.updateInspectorColours = function ()  {

      if ( !$('.budget-inspector-multiple').length ) {

        var selectedSubCat = $('.budget-table-row.is-sub-category.is-checked').find('.budget-table-cell-available-div span.currency')[0]
        var inspectorAvailableText = $('.inspector-overview-available').find('dt');
        var inspectorAvailableFunds = $('.inspector-overview-available').find('span');
        if (!$(selectedSubCat).hasClass('positive')) {
          $(inspectorAvailableText).attr("class", $(selectedSubCat).attr("class")).removeClass('currency');
        }
        $(inspectorAvailableFunds).attr("class", $(selectedSubCat).attr("class"));

      }

    };
    
  } else {
    setTimeout(poll, 250);
  }   
})();