(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true && ynabToolKit.onCurrentRouteChangedInit === true) {
    ynabToolKit.stealingFromNextMonth = (function () {
      function onNextMonthCalculationChanged() {
        let availableToBudget = this.getAvailableToBudget();

        let value = $('.budget-header-totals-details-values .budget-header-totals-cell-value').eq(3);
        let name = $('.budget-header-totals-details-names .budget-header-totals-cell-name').eq(3);

        if (availableToBudget < 0) {
          value.addClass('ynabtk-stealing-from-next-month');
          name.addClass('ynabtk-stealing-from-next-month');

          $('#ynabtk-stealing-amount', name).remove();
          name.append('<span id="ynabtk-stealing-amount"> (<strong>' + ynab.formatCurrency(availableToBudget) + '</strong>)</span>');
        } else {
          value.removeClass('ynabtk-stealing-from-next-month');
          name.removeClass('ynabtk-stealing-from-next-month');
          $('#ynabtk-stealing-amount', name).remove();
        }
      }

      return {
        invoke() {
          let budgetController = ynabToolKit.shared.containerLookup('controller:budget');
          let budgetViewModel = budgetController.get('budgetViewModel');
          if (budgetViewModel) {
            let nextMonth = budgetViewModel.get('monthlyBudgetCalculationForNextMonth');

            nextMonth.addObserver('availableToBudget', onNextMonthCalculationChanged);
            onNextMonthCalculationChanged.call(nextMonth);
          }
        },

        onRouteChanged(currentRoute) {
          if (currentRoute.indexOf('budget') !== -1) {
            ynabToolKit.stealingFromNextMonth.invoke();
          }
        }
      };
    }());

    let currentRoute = ynabToolKit.shared.getCurrentRoute();
    ynabToolKit.stealingFromNextMonth.onRouteChanged(currentRoute);
  } else {
    setTimeout(poll, 250);
  }
}());
