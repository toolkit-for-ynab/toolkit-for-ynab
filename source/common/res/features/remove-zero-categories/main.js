
(function poll() {

  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {

    ynabToolKit.removeZeroCategories = (function () {

      // Supporting functions,
      // or variables, etc

      return {
        invoke: function () {
          var coverOverbudgetingCategories = $('.modal-budget-overspending .dropdown-list > li');
          coverOverbudgetingCategories.each(function () {
            var t = $(this).find('.category-available').text(); // Category balance text.
            var categoryBalance = parseInt(t.replace(/[^\d-]/g, ''));
            if (categoryBalance <= 0) {
              $(this).remove();
            }
          });

          coverOverbudgetingCategories = $('.modal-budget-overspending .dropdown-list > li');

          // Remove empty sections.
          for (var i = 0; i < coverOverbudgetingCategories.length - 1; i++) {
            if ($(coverOverbudgetingCategories[i]).hasClass('section-item') &&
              $(coverOverbudgetingCategories[i + 1]).hasClass('section-item')) {
              $(coverOverbudgetingCategories[i]).remove();
            }
          }

          // Remove last section empty.
          if (coverOverbudgetingCategories.last().hasClass('section-item')) {
            coverOverbudgetingCategories.last().remove();
          }
        },

        observe: function (changedNodes) {
          if (changedNodes.has('dropdown-container categories-dropdown-container')) {
            // We found a modal pop-up
            ynabToolKit.removeZeroCategories.invoke();
          }
        },
      };
    })(); // Keep feature functions contained within this object

    ynabToolKit.removeZeroCategories.invoke(); // Run itself once

  } else {
    setTimeout(poll, 250);
  }
})();
