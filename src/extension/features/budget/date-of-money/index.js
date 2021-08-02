import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';

export class DateOfMoney extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage() && document.querySelector('.tk-date-of-money') === null;
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  invoke() {
    /*
     * Get the parent div from ageOfMoneyContainer.
     * If enabled, days of buffering has the same class, however AOM will always be the first element.
     * This is used to:
     * 		1. To get the Age Of Money (AOM)
     * 		2. Display the Date of Money to the user
     */
    const budgetHeaderDaysAgeContainer = document.querySelector('.budget-header-days-age');
    if (!budgetHeaderDaysAgeContainer) {
      return;
    }

    const dateOfMoneyFormatted = this._getDateOfMoney();
    budgetHeaderDaysAgeContainer.setAttribute('title', dateOfMoneyFormatted);
  }

  _getDateOfMoney(ageOfMoneyLabel) {
    // Get the Age Of Money
    const budgetController = controllerLookup('budget');
    const ageOfMoney = budgetController.get(
      'budgetViewModel.monthlyBudgetCalculationForCurrentMonth.ageOfMoney'
    );

    // Calculate the Date Of Money by subtracting AOM from today's date
    const today = ynab.utilities.DateWithoutTime.createForToday();
    const dateOfMoney = today.subtractDays(ageOfMoney);

    // Apply the user's date format
    return ynab.formatDate(dateOfMoney.format());
  }
}
