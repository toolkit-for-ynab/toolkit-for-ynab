import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { addToolkitEmberHook, l10n } from 'toolkit/extension/utils/toolkit';

export class SubtractUpcomingFromAvailable extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    addToolkitEmberHook(this, 'budget-table-row', 'didRender', this.run);
    addToolkitEmberHook(this, 'budget/budget-inspector', 'didRender', this.run);
  }

  run(element) {
    if (!this.shouldInvoke()) return;
    this.updateAvailableBalance(element);
    this.addTotalAvailableAfterUpcoming(element);
  }

  updateAvailableBalance(element) {
    const elementObject = $(element);
    const subCategoryObject = elementObject.hasClass('is-sub-category') ? elementObject : undefined;
    if (!subCategoryObject) return;

    const subCategory = getEmberView(element.id, 'category');
    if (!subCategory) return;

    if (subCategory.upcomingTransactions) {
      const availableObject = $(`.ynab-new-budget-available-number`, subCategoryObject);
      const availableTextObject = $(`.user-data`, availableObject);

      const available = subCategory.available;
      const upcoming = subCategory.upcomingTransactions;
      const availableAfterUpcoming = available + upcoming;

      availableTextObject.text(formatCurrency(availableAfterUpcoming));

      availableObject.children('svg.icon-upcoming').remove();

      const classes = 'upcoming positive zero negative';
      availableObject.removeClass(classes);
      availableTextObject.removeClass(classes);

      const currencyClass = this.determineCurrencyClass(availableAfterUpcoming);
      availableObject.addClass(currencyClass);
      availableTextObject.addClass(currencyClass);

      if (availableAfterUpcoming >= 0) {
        subCategoryObject.removeAttr('data-toolkit-negative-available');

        if (subCategory.isOverSpent) {
          availableObject.addClass('cautious');
          availableTextObject.addClass('cautious');
        }
      }
    }
  }

  addTotalAvailableAfterUpcoming(element) {
    $('#total-available-after-upcoming').remove();

    const elementObject = $(element);
    const budgetInspectorObject = elementObject.hasClass('budget-inspector')
      ? elementObject
      : undefined;
    if (!budgetInspectorObject) return;

    const budgetInspector = getEmberView(element.id);
    if (!budgetInspector) return;

    // When one category is selected, YNAB provides their own "Available After Upcoming" so we don't need ours.
    const localizedMessage = l10n(
      'inspector.availableMessage.afterUpcoming',
      'Available After Upcoming'
    );
    const availableAfterUpcomingMessage = $(
      '.inspector-message-label',
      budgetInspectorObject
    ).filter(function () {
      return this.innerText === localizedMessage;
    });
    if (availableAfterUpcomingMessage.length) return;

    const totalAvailable = budgetInspector.budgetTotals.available;
    const totalUpcoming = this.getTotalUpcoming(budgetInspector);
    if (totalUpcoming === 0) return;

    const totalAvailableAfterUpcoming = totalAvailable + totalUpcoming;
    const availableBreakdownObject = $('.ynab-breakdown', budgetInspectorObject);

    this.createInspectorElement(totalAvailableAfterUpcoming).prependTo(availableBreakdownObject);
  }

  createInspectorElement(totalAvailableAfterUpcoming) {
    const localizedTitle = l10n(
      'toolkit.availableAfterUpcoming',
      'Available After Upcoming Transactions'
    );

    const currencyClass = this.determineCurrencyClass(totalAvailableAfterUpcoming);

    totalAvailableAfterUpcoming = formatCurrency(totalAvailableAfterUpcoming);

    return $(`
      <div id="total-available-after-upcoming">
        <div>${localizedTitle}</div>
        <div class="user-data">
          <span class="user-data currency ${currencyClass}">
            ${totalAvailableAfterUpcoming}
          </span>
        </div>
      </div>
    `);
  }

  getTotalUpcoming(budgetInspector) {
    let totalUpcoming = 0;

    for (const category of budgetInspector.inspectorCategories) {
      totalUpcoming += category.upcomingTransactions;
    }

    return totalUpcoming;
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
