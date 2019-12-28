import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

export class DateOfMoney extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
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
     * Get the div containing the Age Of Money (AOM)
     * If enabled, days of buffering has the same class, however AOM will always be the first element
     */
    const ageOfMoneyContainer = budgetHeaderDaysContainer.firstElementChild;
    /*
     * Get the Age Of Money
     */
    let ageOfMoney = 0;
    const regExAOM = /\d+/;
    const regExAOMResult = regExAOM.exec(ageOfMoneyContainer.innerText);
    if (regExAOMResult != null) {
      ageOfMoney = regExAOMResult[0];
    } else {
      return;
    }
    // Calculate the Date Of Money by subtracting AOM from today's date
    const today = ynab.utilities.DateWithoutTime.createForToday();
    const dateOfMoney = today.subtractDays(ageOfMoney);
    // Apply the user's date format
    const dateOfMoneyFormatted = ynab.formatDate(dateOfMoney.format());
    // Create and style the node to display
    let dateOfMoneyContainer = budgetHeaderDaysContainer.lastElementChild.cloneNode();
    dateOfMoneyContainer.innerText = dateOfMoneyFormatted;
    dateOfMoneyContainer.style.color = 'var(--header_age_of_money_text)';
    dateOfMoneyContainer.style.paddingTop = '3px';
    dateOfMoneyContainer.style.paddingBottom = '.25em';
    // Display the Date Of Money to the user
    budgetHeaderDaysContainer.appendChild(dateOfMoneyContainer);
  }
}
