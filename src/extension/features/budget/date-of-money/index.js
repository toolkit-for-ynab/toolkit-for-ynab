import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';

export class DateOfMoney extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  destroy() {
    document.querySelector('.budget-header-days-age').setAttribute('title', '');
  }

  invoke() {
    const budgetHeaderDaysAgeContainer = document.querySelector('.budget-header-days-age');
    if (!budgetHeaderDaysAgeContainer) {
      return;
    }

    const budgetController = controllerLookup('budget');
    const ageOfMoney = budgetController.get(
      'budgetViewModel.monthlyBudgetCalculationForCurrentMonth.ageOfMoney'
    );

    // Calculate the Date Of Money by subtracting AOM from today's date
    const today = ynab.utilities.DateWithoutTime.createForToday();
    const dateOfMoney = today.subtractDays(ageOfMoney);
    budgetHeaderDaysAgeContainer.setAttribute('title', ynab.formatDate(dateOfMoney.format()));
  }
}
