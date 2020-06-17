import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';

export class DateOfMoney extends Feature {
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
     * This is used to:
     * 		1. To get the Age Of Money (AOM)
     * 		2. Display the Date of Money to the user
     */
    const budgetHeaderDaysContainer = document.querySelector('.budget-header-days');

    /*
     * Get the div containing the Age Of Money (AOM) and add a mouse over function to display date of money.
     * If enabled, days of buffering has the same class, however AOM will always be the first element.
     */
    const ageOfMoneyContainer = budgetHeaderDaysContainer.firstElementChild;
    if (!ageOfMoneyContainer) {
      return;
    }

    ageOfMoneyContainer.addEventListener(
      'mouseover',
      function() {
        this._showDateOfMoney(budgetHeaderDaysContainer, ageOfMoneyContainer);
      }.bind(this)
    );
  }

  _showDateOfMoney(budgetHeaderDaysContainer, ageOfMoneyContainer) {
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

    // Create and style the node to display
    let dateOfMoneyContainer = ageOfMoneyContainer.cloneNode();
    dateOfMoneyContainer.innerText = dateOfMoneyFormatted;
    dateOfMoneyContainer.classList.add('tk-date-of-money');

    // Display the Date Of Money to the user
    ageOfMoneyContainer.style.display = 'none';
    budgetHeaderDaysContainer.insertBefore(dateOfMoneyContainer, ageOfMoneyContainer);

    // Add the event listener to hide Date Of Money and display Age Of Money
    dateOfMoneyContainer.addEventListener(
      'mouseout',
      function() {
        this._hideDateOfMoney(ageOfMoneyContainer, dateOfMoneyContainer);
      }.bind(this)
    );
  }

  _hideDateOfMoney(ageOfMoneyContainer, dateOfMoneyContainer) {
    // Delete Date Of Money div from the dom and display Age Of Money again
    dateOfMoneyContainer.remove();
    ageOfMoneyContainer.style.display = '';
  }
}
