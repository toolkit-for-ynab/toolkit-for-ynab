function removeZeroCategoriesFromCoverOverbudgeting() {
  var coverOverbudgetingCategories = $( "fieldset>.options-shown>.ynab-select-options" ).children('li');
  coverOverbudgetingCategories.each(function(i) { 
    var t = $(this).text(); // Category balance text.
    var categoryBalance = parseInt(t.substr(t.length - t.indexOf(":") + 2).replace( /\D/g, ''))
    if (categoryBalance == 0) {
      $(this).remove();
    }
  });
}

setInterval(removeZeroCategoriesFromCoverOverbudgeting, 50);