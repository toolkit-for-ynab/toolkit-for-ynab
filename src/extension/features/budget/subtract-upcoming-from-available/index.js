import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';

let totalUpcoming = 0;

export class SubtractUpcomingFromAvailable extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    addToolkitEmberHook(this, 'budget-bar-v2', 'didRender', this.run);
    addToolkitEmberHook(this, 'budget-bar-v2', 'didUpdate', this.run);

    addToolkitEmberHook(this, 'budget/inspector/default-inspector', 'didRender', this.run);
    addToolkitEmberHook(this, 'budget/inspector/multi-select-inspector', 'didRender', this.run);
  }

  run() {
    if (!this.shouldInvoke()) return;
    this.updateAvailableBalance();
    this.addTotalAvailableAfterUpcoming();
  }

  updateAvailableBalance() {
    totalUpcoming = 0;

    $('.budget-table-row.is-sub-category').each((_, element) => {
      const category = getEmberView(element.id, 'category');
      if (!category) return;

      if (category.upcomingTransactions) {
        const categoryRow = $(`[data-entity-id=${category.subCategoryId}]`);

        const availableObject = $(`.ynab-new-budget-available-number`, categoryRow);
        const availableTextObject = $(`.user-data`, availableObject);

        const available = category.available;
        const upcoming = category.upcomingTransactions;
        const availableAfterUpcoming = available + upcoming;

        availableTextObject.text(formatCurrency(availableAfterUpcoming));

        availableObject.children('svg.icon-upcoming').remove();

        const hasCautiousCredit =
          availableObject.hasClass('cautious') && availableObject.hasClass('credit');

        if (!hasCautiousCredit) {
          const classes = 'cautious upcoming credit positive zero negative';

          availableObject.removeClass(classes);
          availableTextObject.removeClass(classes);

          const currencyClass = this.determineCurrencyClass(availableAfterUpcoming);
          availableObject.addClass(currencyClass);
          availableTextObject.addClass(currencyClass);
        }

        totalUpcoming += upcoming;
      }
    });
  }

  addTotalAvailableAfterUpcoming() {
    const budgetInspectorObject = $('.budget-inspector-content').children().first();
    if (!budgetInspectorObject.length) return;

    const budgetInspectorElement = budgetInspectorObject[0];
    if (!budgetInspectorElement.id) return;

    const budgetInspector = getEmberView(budgetInspectorElement.id);
    if (!budgetInspector) return;

    const totalAvailable = budgetInspector.budgetTotals.available;
    const totalAvailableAfterUpcoming = totalAvailable + totalUpcoming;

    const totalAvailableHeader = budgetInspectorObject.find('h3').filter(function () {
      return $(this).text() === 'TOTAL AVAILABLE';
    });
    const endOfTotalAvailable = totalAvailableHeader.nextAll('hr')[0];

    $('.total-available-after-upcoming-inspector').remove();
    this.createInspectorElement(totalAvailableAfterUpcoming).insertAfter(endOfTotalAvailable);
  }

  createInspectorElement(totalAvailableAfterUpcoming) {
    const currencyClass = this.determineCurrencyClass(totalAvailableAfterUpcoming);

    totalAvailableAfterUpcoming = formatCurrency(totalAvailableAfterUpcoming);

    return $(`
      <div class="total-available-after-upcoming-inspector">
        <h3>TOTAL AVAILABLE AFTER UPCOMING TRANSACTIONS</h3>
        <h1 title>
          <span class="user-data currency ${currencyClass}">
            ${totalAvailableAfterUpcoming}
          </span>
        </h1>
        <hr />
      </div>
    `);
  }

  determineCurrencyClass(amount) {
    let currencyClass = 'positive';

    if (amount < 0) {
      currencyClass = 'negative';
    } else if (amount === 0) {
      currencyClass = 'zero';
    }

    return currencyClass;
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
