import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

export class DaysOfBufferingDate extends Feature {
  shouldInvoke() {
    // Check the budget page is on screen and the Days Of Buffering have been loaded.
    return (
      isCurrentRouteBudgetPage() &&
      ynabToolKit.options.DaysOfBuffering &&
      document.querySelector('.toolkit-days-of-buffering') != null
    );
  }

  observe(changedNodes) {
    if (
      !this.shouldInvoke() ||
      changedNodes.has('budget-header-days-label toolkit-date-of-buffering')
    ) {
      return;
    }
    if (changedNodes.has('budget-header-item budget-header-days toolkit-days-of-buffering')) {
      this.invoke();
    }
  }

  invoke() {
    /*
     * Get the parent div for the daysOfBufferingContainer.
     * This is used to:
     * 		1. To get the Days Of Buffering
     * 		2. Display the Date of Buffering to the user
     */
    const toolkitDaysOfBuffering = document.querySelector('.toolkit-days-of-buffering');
    /*
     * Get the div containing the Age Of Money (AOM)
     * If enabled, days of buffering has the same class, however AOM will always be the first element
     */
    const daysOfBufferingContainer = toolkitDaysOfBuffering.firstElementChild;
    /*
     * Get the Days Of Buffering
     */
    let daysOfBuffering = 0;
    const regExDOB = /\d+/;
    const regExDOBResult = regExDOB.exec(daysOfBufferingContainer.innerText);
    if (regExDOBResult != null) {
      daysOfBuffering = regExDOBResult[0];
    } else {
      return;
    }

    // Calculate the Date Of Money by subtracting AOM from today's date
    const today = ynab.utilities.DateWithoutTime.createForToday();
    const dateOfBuffering = today.addDays(daysOfBuffering);

    // Apply the user's date format
    const dateOfMoneyFormatted = ynab.formatDate(dateOfBuffering.format());

    // Create and style the node to display
    let dateOfBufferingContainer = toolkitDaysOfBuffering.lastElementChild.cloneNode();
    dateOfBufferingContainer.innerText = dateOfMoneyFormatted;
    dateOfBufferingContainer.style.color = '#23b2ce';
    dateOfBufferingContainer.style.paddingTop = '3px';
    dateOfBufferingContainer.style.paddingBottom = '.25em';
    dateOfBufferingContainer.classList.add('toolkit-date-of-buffering');

    // Display the Date Of Money to the user
    toolkitDaysOfBuffering.appendChild(dateOfBufferingContainer);
  }
}
