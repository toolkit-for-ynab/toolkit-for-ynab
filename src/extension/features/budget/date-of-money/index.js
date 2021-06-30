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
    const ageOfMoneyLabel = document.querySelector('.budget-header-days-label');
    if (!ageOfMoneyLabel) {
      return;
    }

    const originalText = ageOfMoneyLabel.innerText;

    ageOfMoneyContainer.addEventListener(
      'mouseover',
      function () {
        this._showDateOfMoney(ageOfMoneyLabel);
      }.bind(this)
    );
    ageOfMoneyContainer.addEventListener(
      'mouseout',
      function () {
        this._hideDateOfMoney(originalText, ageOfMoneyLabel);
      }.bind(this)
    );
  }

  _showDateOfMoney(ageOfMoneyLabel) {
    // Get the Age Of Money
    const budgetController = controllerLookup('budget');
    const ageOfMoney = budgetController.get(
      'budgetViewModel.monthlyBudgetCalculationForCurrentMonth.ageOfMoney'
    );

    // Calculate the Date Of Money by subtracting AOM from today's date
    const today = ynab.utilities.DateWithoutTime.createForToday();
    const dateOfMoney = today.subtractDays(ageOfMoney);

    // Apply the user's date format
    const dateOfMoneyFormatted = ynab.formatDate(dateOfMoney.format());

    // Change ageOfMoneyLabel content for date of money
    ageOfMoneyLabel.innerText = dateOfMoneyFormatted;
  }

  _hideDateOfMoney(originalText, ageOfMoneyLabel) {
    // Change ageOfMoneyLabel content for original text
    ageOfMoneyLabel.innerText = originalText;
  }
}
