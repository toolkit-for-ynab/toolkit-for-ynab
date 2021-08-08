import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { addToolkitEmberHook, l10n } from 'toolkit/extension/utils/toolkit';
import { getTotalSavings } from 'toolkit/extension/features/budget/show-available-after-savings/index';

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
    this.updateCategoryAvailableBalance(element);
    this.addTotalAvailableAfterUpcoming(element);
  }

  updateCategoryAvailableBalance(element) {
    const category = getEmberView(element.id);
    if (!category.upcomingTransactions) return;

    const $available = $(`.ynab-new-budget-available-number`, element);
    const $availableText = $(`.user-data`, $available);

    const available = category.available;
    const upcoming = category.upcomingTransactions;
    const availableAfterUpcoming = available + upcoming;

    $availableText.text(formatCurrency(availableAfterUpcoming));

    $available.children('svg.icon-upcoming').remove();

    const classes = 'upcoming positive zero negative';
    $available.removeClass(classes);
    $availableText.removeClass(classes);

    const currencyClass = this.getCurrencyClass(availableAfterUpcoming);
    $available.addClass(currencyClass);
    $availableText.addClass(currencyClass);

    if (availableAfterUpcoming >= 0) {
      $(element).removeAttr('data-toolkit-negative-available');

      if (category.isOverSpent) {
        $available.addClass('cautious');
        $availableText.addClass('cautious');
      }
    } else if (!category.isOverSpent) {
      $available.removeClass('cautious');
      $availableText.removeClass('cautious');
    }
  }

  addTotalAvailableAfterUpcoming(element) {
    const $budgetBreakdownMonthlyTotals = $('.budget-breakdown-monthly-totals', element);
    if (!$budgetBreakdownMonthlyTotals.length) return;

    const elementId = 'total-available-after-upcoming';
    $(`#${elementId}`, $budgetBreakdownMonthlyTotals).remove();

    const budgetBreakdown = getEmberView(element.id);

    // When one category is selected, YNAB provides their own "Available After Upcoming" so we don't need ours.
    if (this.ynabAvailableAfterUpcomingExists($budgetBreakdownMonthlyTotals)) return;

    const totalAvailable = ynabToolKit.options.SubtractSavingsFromTotalAvailable
      ? budgetBreakdown.budgetTotals.available - getTotalSavings(budgetBreakdown)
      : budgetBreakdown.budgetTotals.available;
    const totalUpcoming = this.getTotalUpcoming(budgetBreakdown);
    const totalOfCCBalances = this.getTotalOfCCBalances(budgetBreakdown);

    let totalAvailableAfterUpcoming = totalAvailable;

    if (this.settings.enabled === 'upcoming-only') totalAvailableAfterUpcoming += totalUpcoming;
    if (this.settings.enabled === 'cc-only') totalAvailableAfterUpcoming += totalOfCCBalances;
    if (this.settings.enabled === 'both')
      totalAvailableAfterUpcoming += totalUpcoming + totalOfCCBalances;

    if (totalAvailableAfterUpcoming === totalAvailable) return;

    const localizedTitle = l10n(
      'toolkit.availableAfterUpcoming',
      'Available After Upcoming Transactions'
    );

    const $ynabBreakdown = $('.ynab-breakdown', $budgetBreakdownMonthlyTotals);

    // append to Available After Savings if it exists
    createBudgetBreakdownElement(elementId, localizedTitle, totalAvailableAfterUpcoming).prependTo(
      $ynabBreakdown
    );
  }

  ynabAvailableAfterUpcomingExists($context) {
    const localizedMessageText = l10n(
      'inspector.availableMessage.afterUpcoming',
      'Available After Upcoming'
    );
    return $('.inspector-message-label', $context).filter(function () {
      return this.innerText === localizedMessageText;
    }).length;
  }

  getTotalUpcoming(budgetBreakdown) {
    let totalUpcoming = 0;

    for (const category of budgetBreakdown.inspectorCategories) {
      totalUpcoming += category.upcomingTransactions;
    }

    return totalUpcoming; // Returns negative amount. Each category.upcomingTransactions is negative.
  }

  getTotalOfCCBalances(budgetBreakdown) {
    let totalOfCCBalances = 0;

    for (const category of budgetBreakdown.inspectorCategories) {
      if (category.isCreditCardPaymentCategory) totalOfCCBalances -= category.available;
    }

    return totalOfCCBalances; // Returns negative amount. Each category.available is positive.
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

export function createBudgetBreakdownElement(elementId, title, amount) {
  const currencyClass = SubtractUpcomingFromAvailable.getCurrencyClass(amount);
  amount = formatCurrency(amount);

  return $(`
    <div id="${elementId}">
      <div>${title}</div>
      <div class="user-data">
        <span class="user-data currency ${currencyClass}">
          ${amount}
        </span>
      </div>
    </div>
  `);
}
