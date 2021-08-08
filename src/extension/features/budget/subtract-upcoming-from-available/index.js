import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { addToolkitEmberHook, l10n } from 'toolkit/extension/utils/toolkit';
import { getTotalSavings } from 'toolkit/extension/features/budget/subtract-savings-from-total-available/index';

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
    const $element = $(element);
    const $category = $element.hasClass('is-sub-category') ? $element : undefined;
    if (!$category) return;

    const category = getEmberView(element.id, 'category');
    if (!category) return;

    if (category.upcomingTransactions) {
      const $available = $(`.ynab-new-budget-available-number`, $category);
      const $availableText = $(`.user-data`, $available);

      const available = category.available;
      const upcoming = category.upcomingTransactions;
      const availableAfterUpcoming = available + upcoming;

      $availableText.text(formatCurrency(availableAfterUpcoming));

      $available.children('svg.icon-upcoming').remove();

      const classes = 'upcoming positive zero negative';
      $available.removeClass(classes);
      $availableText.removeClass(classes);

      const currencyClass = getCurrencyClass(availableAfterUpcoming);
      $available.addClass(currencyClass);
      $availableText.addClass(currencyClass);

      if (availableAfterUpcoming >= 0) {
        $category.removeAttr('data-toolkit-negative-available');

        if (category.isOverSpent) {
          $available.addClass('cautious');
          $availableText.addClass('cautious');
        }
      } else if (!category.isOverSpent) {
        $available.removeClass('cautious');
        $availableText.removeClass('cautious');
      }
    }
  }

  addTotalAvailableAfterUpcoming(element) {
    const $budgetBreakdownMonthlyTotals = $('.budget-breakdown-monthly-totals', element);
    if (!$budgetBreakdownMonthlyTotals.length) return;

    const budgetBreakdownMonthlyTotals = getEmberView(element.id);
    if (!budgetBreakdownMonthlyTotals) return;

    $('#total-available-after-upcoming').remove();

    // When one category is selected, YNAB provides their own "Available After Upcoming" so we don't need ours.
    const localizedMessageText = l10n(
      'inspector.availableMessage.afterUpcoming',
      'Available After Upcoming'
    );
    const $ynabAvailableAfterUpcomingMessage = $(
      '.inspector-message-label',
      $budgetBreakdownMonthlyTotals
    ).filter(function () {
      return this.innerText === localizedMessageText;
    });
    if ($ynabAvailableAfterUpcomingMessage.length) return;

    // const
    let totalAvailable = budgetBreakdownMonthlyTotals.budgetTotals.available;
    const totalUpcoming = this.getTotalUpcoming(budgetBreakdownMonthlyTotals);
    const totalOfCCBalances = this.getTotalOfCCBalances(budgetBreakdownMonthlyTotals);

    if (ynabToolKit.options.SubtractSavingsFromTotalAvailable)
      totalAvailable -= getTotalSavings(budgetBreakdownMonthlyTotals);

    let totalAvailableAfterUpcoming = totalAvailable;

    if (this.settings.enabled === 'upcoming-only') totalAvailableAfterUpcoming += totalUpcoming;
    if (this.settings.enabled === 'cc-only') totalAvailableAfterUpcoming += totalOfCCBalances;
    if (this.settings.enabled === 'both')
      totalAvailableAfterUpcoming += totalUpcoming + totalOfCCBalances;

    if (totalAvailableAfterUpcoming === totalAvailable) return;

    const $ynabBreakdown = $('.ynab-breakdown', $budgetBreakdownMonthlyTotals);

    // append to Available After Savings if it exists
    this.createBreakdownElement(totalAvailableAfterUpcoming).prependTo($ynabBreakdown);
  }

  createBreakdownElement(totalAvailableAfterUpcoming) {
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

    return totalUpcoming; // Returns negative value. Each category.upcomingTransactions is negative.
  }

  getTotalOfCCBalances(budgetBreakdown) {
    let totalOfCCBalances = 0;

    for (const category of budgetBreakdown.inspectorCategories) {
      if (category.isCreditCardPaymentCategory) totalOfCCBalances -= category.available;
    }

    return totalOfCCBalances; // Returns negative value. Each category.available is positive.
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
