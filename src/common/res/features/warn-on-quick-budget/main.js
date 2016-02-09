(function poll() {

  if (typeof ynabToolKit !== "undefined" && ynabToolKit.actOnChangeInit === true) {

    ynabToolKit.warnOnQuickBudget = new function() {

      this.invoke = function() {
        var buttons = document.getElementsByClassName('budget-inspector-button');
        for (var i = 0; i < buttons.length; i++) {
          button = buttons[i];
          button.onclick = function(event) {
            var e = event || window.event;
            var parent = $(button).parent().parent().parent();
            if ($(parent).hasClass('budget-inspector-default')) { // No row selected
              var budgetRows = $('.budget-table-cell-budgeted');
              var accepted = false;
              budgetRows.each(function(index, el) {
                if ($(el).find('span.user-data').length > 0) {
                  if (!$($(el).find('span.user-data')[0]).hasClass('zero')) { // Something was budgeted
                  if (!confirm('Are you sure you want to replace previously budgeted values?')) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                  } else {
                    return false;
                  }
                }
              }
              });
            } else if ($(parent).hasClass('budget-inspector')) { // Row selected
              if (!$($(parent).find('.budget-inspector-category-overview').find('span.user-data')[1]).hasClass('zero')) { // Something was budgeted
                if (!confirm('Are you sure you want to replace previously budgeted value?')) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }
            }
          }
        }
      },

      this.observe = function(changedNodes) {

      if (changedNodes.has('navlink-budget active')) {
          // The user has returned back to the budget screen
          ynabToolKit.warnOnQuickBudget.invoke();
        } else

        // The user has changed their budget row selection
        if (changedNodes.has('budget-inspector')) {
          ynabToolKit.warnOnQuickBudget.invoke();
        }
      };

    }; // Keep feature functions contained within this
    ynabToolKit.warnOnQuickBudget.invoke();

  } else {
    setTimeout(poll, 250);
  }
})();
