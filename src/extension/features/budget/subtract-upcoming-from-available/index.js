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
    addToolkitEmberHook(this, 'budget-breakdown', 'didRender', this.run);
  }

  run(element) {
    if (!this.shouldInvoke()) return;
    this.updateAvailableBalance(element);
    this.addTotalAvailableAfterUpcoming(element);
  }

  updateAvailableBalance(element) {
    const elementObject = $(element);
    const categoryObject = elementObject.hasClass('is-sub-category') ? elementObject : undefined;
    if (!categoryObject) return;

    const category = getEmberView(element.id, 'category');
    if (!category) return;

    if (category.upcomingTransactions) {
      const availableObject = $(`.ynab-new-budget-available-number`, categoryObject);
      const availableTextObject = $(`.user-data`, availableObject);

      const available = category.available;
      const upcoming = category.upcomingTransactions;
      const availableAfterUpcoming = available + upcoming;

      availableTextObject.text(formatCurrency(availableAfterUpcoming));

      availableObject.children('svg.icon-upcoming').remove();

      const classes = 'upcoming positive zero negative';
      availableObject.removeClass(classes);
      availableTextObject.removeClass(classes);

      const currencyClass = this.getCurrencyClass(availableAfterUpcoming);
      availableObject.addClass(currencyClass);
      availableTextObject.addClass(currencyClass);

      if (availableAfterUpcoming >= 0) {
        categoryObject.removeAttr('data-toolkit-negative-available');

        if (category.isOverSpent) {
          availableObject.addClass('cautious');
          availableTextObject.addClass('cautious');
        }
      } else if (!category.isOverSpent) {
        availableObject.removeClass('cautious');
        availableTextObject.removeClass('cautious');
      }
    }
  }

  addTotalAvailableAfterUpcoming(element) {
    const elementObject = $(element);
    const budgetBreakdownObject = elementObject.hasClass('budget-breakdown')
      ? elementObject
      : undefined;
    if (!budgetBreakdownObject) return;

    const budgetBreakdown = getEmberView(element.id);
    if (!budgetBreakdown) return;

    $('#total-available-after-upcoming').remove();

    // When one category is selected, YNAB provides their own "Available After Upcoming" so we don't need ours.
    const localizedMessageText = l10n(
      'inspector.availableMessage.afterUpcoming',
      'Available After Upcoming'
    );
    const ynabAvailableAfterUpcomingMessageObject = $(
      '.inspector-message-label',
      budgetBreakdownObject
    ).filter(function () {
      return this.innerText === localizedMessageText;
    });
    if (ynabAvailableAfterUpcomingMessageObject.length) return;

    const totalAvailable = budgetBreakdown.budgetTotals.available;
    const totalUpcoming = this.getTotalUpcoming(budgetBreakdown);
    const totalOfCCBalances = this.getTotalOfCCBalances(budgetBreakdown);

    let totalAvailableAfterUpcoming = totalAvailable;

    if (this.settings.enabled === 'upcoming-only') totalAvailableAfterUpcoming += totalUpcoming;
    if (this.settings.enabled === 'cc-only') totalAvailableAfterUpcoming += totalOfCCBalances;
    if (this.settings.enabled === 'both')
      totalAvailableAfterUpcoming += totalUpcoming + totalOfCCBalances;

    if (totalAvailableAfterUpcoming === totalAvailable) return;

    const ynabBreakdownObject = $('.ynab-breakdown', budgetBreakdownObject);

    this.createInspectorElement(totalAvailableAfterUpcoming).prependTo(ynabBreakdownObject);
  }

  createInspectorElement(totalAvailableAfterUpcoming) {
    const localizedTitle = l10n(
      'toolkit.availableAfterUpcoming',
      'Available After Upcoming Transactions'
    );

    const currencyClass = this.getCurrencyClass(totalAvailableAfterUpcoming);

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

  getTotalUpcoming(budgetBreakdown) {
    let totalUpcoming = 0;

    for (const category of budgetBreakdown.inspectorCategories) {
      totalUpcoming += category.upcomingTransactions;
    }

    return totalUpcoming;
  }

  getTotalOfCCBalances(budgetBreakdown) {
    let totalOfCCBalances = 0;

    for (const category of budgetBreakdown.inspectorCategories) {
      if (category.isCreditCardPaymentCategory) totalOfCCBalances -= category.available;
    }

    return totalOfCCBalances;
  }

  getCurrencyClass(amount) {
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
