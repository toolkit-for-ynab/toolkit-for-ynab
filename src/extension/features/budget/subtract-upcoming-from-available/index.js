import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { addToolkitEmberHook, l10n } from 'toolkit/extension/utils/toolkit';
import { getTotalSavings } from 'toolkit/extension/features/budget/subtract-savings-from-available/index';

export class SubtractUpcomingFromAvailable extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    this.addToolkitEmberHook('budget-table-row', 'didRender', this.run);
    this.addToolkitEmberHook('budget-breakdown', 'didRender', this.run);
  }

  run(element) {
    if (!this.shouldInvoke()) return;
    this.updateAvailableBalance(element);
    this.addTotalAvailableAfterUpcoming(element);
  }

  updateAvailableBalance(element) {
    const $element = $(element);
    const $category = $element.hasClass('is-sub-category') ? $element : undefined;
    if (!$category) return;

    const category = getEmberView(element.id, 'category');
    if (!category) return;

    if (category.upcomingTransactions) {
      const availableObject = $(`.ynab-new-budget-available-number`, $category);
      const availableTextObject = $(`.user-data`, availableObject);

      const available = category.available;
      const upcoming = category.upcomingTransactions;
      const availableAfterUpcoming = available + upcoming;

      availableTextObject.text(formatCurrency(availableAfterUpcoming));

      availableObject.children('svg.icon-upcoming').remove();

      const classes = 'upcoming positive zero negative';
      availableObject.removeClass(classes);
      availableTextObject.removeClass(classes);

      const currencyClass = getCurrencyClass(availableAfterUpcoming);
      availableObject.addClass(currencyClass);
      availableTextObject.addClass(currencyClass);

      if (availableAfterUpcoming >= 0) {
        $category.removeAttr('data-toolkit-negative-available');

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
    const budgetBreakdownMonthlyTotals = $('.budget-breakdown-monthly-totals', element);
    if (!budgetBreakdownMonthlyTotals.length) return;

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
      budgetBreakdownMonthlyTotals
    ).filter(function () {
      return this.innerText === localizedMessageText;
    });
    if (ynabAvailableAfterUpcomingMessageObject.length) return;

    let totalAvailable = budgetBreakdown.budgetTotals.available;
    const totalUpcoming = this.getTotalUpcoming(budgetBreakdown);
    const totalOfCCBalances = this.getTotalOfCCBalances(budgetBreakdown);

    if (ynabToolKit.options.SubtractSavingsFromAvailable)
      totalAvailable -= getTotalSavings(budgetBreakdown);

    let totalAvailableAfterUpcoming = totalAvailable;

    if (this.settings.enabled === 'upcoming-only') totalAvailableAfterUpcoming += totalUpcoming;
    if (this.settings.enabled === 'cc-only') totalAvailableAfterUpcoming += totalOfCCBalances;
    if (this.settings.enabled === 'both')
      totalAvailableAfterUpcoming += totalUpcoming + totalOfCCBalances;

    if (totalAvailableAfterUpcoming === totalAvailable) return;

    const ynabBreakdownObject = $('.ynab-breakdown', budgetBreakdownMonthlyTotals);

    this.createInspectorElement(totalAvailableAfterUpcoming).prependTo(ynabBreakdownObject);
  }

  createInspectorElement(totalAvailableAfterUpcoming) {
    const localizedTitle = l10n(
      'toolkit.availableAfterUpcoming',
      'Available After Upcoming Transactions'
    );

    const currencyClass = getCurrencyClass(totalAvailableAfterUpcoming);

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

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}

export function getCurrencyClass(amount) {
  let currencyClass = 'positive';

  if (amount < 0) {
    currencyClass = 'negative';
  } else if (amount === 0) {
    currencyClass = 'zero';
  }

  return currencyClass;
}
