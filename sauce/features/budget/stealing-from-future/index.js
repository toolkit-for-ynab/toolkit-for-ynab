import { Feature } from 'core/feature';
import * as toolkitHelper from 'helpers/toolkit';

// TODO: move income-from-last-month to the new framework and just export this
// variable from that feature
const INCOME_FROM_LAST_MONTH_CLASSNAME = 'income-from-last-month';

export class StealingFromFuture extends Feature {
  injectCSS() { return require('./index.css'); }

  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('budget') !== -1;
  }

  isMonthABeforeB(a, b) {
    if (b === null) return true;

    const [yearA, monthA] = a.split('-').map((val) => parseInt(val));
    const [yearB, monthB] = b.split('-').map((val) => parseInt(val));
    if (yearA >= yearB && monthA >= monthB) {
      return false;
    }

    return true;
  }

  onAvailableToBudgetChange(budgetViewModel) {
    let earliestEntityDate = null;
    let earliestNegativeMonth = null;
    let earliestNegativeMonthCalculation = null;
    budgetViewModel.get('allBudgetMonthsViewModel.monthlyBudgetCalculationsCollection').forEach((monthCalculation) => {
      if (this.isMonthEntityIdFuture(monthCalculation.get('entityId'))) {
        const entityDate = monthCalculation.get('entityId').match(/mbc\/(.*)\/.*/)[1];
        const entityMonth = entityDate.split('-').map((val) => parseInt(val))[1];

        if (monthCalculation.get('availableToBudget') < 0 && this.isMonthABeforeB(entityDate, earliestEntityDate)) {
          earliestEntityDate = entityDate;
          earliestNegativeMonth = entityMonth;
          earliestNegativeMonthCalculation = monthCalculation;
        }
      }
    });

    // there's no easy class name on the thing we want to highlight so
    // we have to just select the specific row. if the user has the income
    // from last month feature on and it has already invoked, then the row
    // we want is number 4, else 3.
    let futureBudgetRow = 3;
    if (ynabToolKit.options.incomeFromLastMonth !== '0') {
      if ($(`.budget-header-totals-details-values .${INCOME_FROM_LAST_MONTH_CLASSNAME}`).length) {
        futureBudgetRow = 4;
      }
    }

    const value = $('.budget-header-totals-details-values .budget-header-totals-cell-value').eq(futureBudgetRow);
    const name = $('.budget-header-totals-details-names .budget-header-totals-cell-name').eq(futureBudgetRow);

    // no negative months! good job team!
    if (earliestNegativeMonth === null) {
      value.removeClass('ynabtk-stealing-from-next-month');
      name.removeClass('ynabtk-stealing-from-next-month');
      $('#ynabtk-stealing-amount', name).remove();
      return;
    }

    value.addClass('ynabtk-stealing-from-next-month');
    name.addClass('ynabtk-stealing-from-next-month');

    const availableToBudget = earliestNegativeMonthCalculation.getAvailableToBudget();
    $('#ynabtk-stealing-amount', name).remove();
    name.append(
      '<span id="ynabtk-stealing-amount"> (' +
        '<strong>' +
          `${ynab.formatCurrency(availableToBudget)} in ` +
          `<a class="ynabtk-month-link">${ynabToolKit.shared.monthsFull[earliestNegativeMonth - 1]}</a>` +
        '</strong>' +
      ')</span>');

    $('.ynabtk-month-link', name).click((event) => {
      event.preventDefault();
      const applicationController = toolkitHelper.controllerLookup('application');
      const budgetVersionId = applicationController.get('budgetVersionId');
      toolkitHelper.transitionTo('budget.select', budgetVersionId, earliestEntityDate.replace('-', ''));
    });
  }

  isMonthEntityIdFuture(entityId) {
    const currentYear = parseInt(moment().format('YYYY'));
    const currentMonth = parseInt(moment().format('MM'));
    const entityDate = entityId.match(/mbc\/(.*)\/.*/)[1];
    const [entityYear, entityMonth] = entityDate.split('-').map((val) => parseInt(val));
    if (entityYear >= currentYear && entityMonth > currentMonth) {
      return true;
    }

    return false;
  }

  invoke() {
    let budgetController = ynabToolKit.shared.containerLookup('controller:budget');
    let budgetViewModel = budgetController.get('budgetViewModel');
    if (budgetViewModel) {
      budgetViewModel.get('allBudgetMonthsViewModel.monthlyBudgetCalculationsCollection').forEach((month) => {
        month.addObserver('availableToBudget', this.onAvailableToBudgetChange.bind(this, budgetViewModel));
      });

      this.onAvailableToBudgetChange(budgetViewModel);
    }
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
