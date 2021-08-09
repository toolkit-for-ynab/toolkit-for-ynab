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
    this.addToolkitEmberHook('budget-table-row', 'didRender', this.run);
    this.addToolkitEmberHook('budget-breakdown', 'didRender', this.run);
  }

  run(element) {
    if (!this.shouldInvoke()) return;
    this.updateCategoryAvailableBalance(element);
    this.addTotalAvailableAfterUpcoming(element);
  }

  updateCategoryAvailableBalance(element) {
    const category = getEmberView(element.id, 'category');
    if (!category) return;
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

    const currencyClass = getCurrencyClass(availableAfterUpcoming);
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

    const budgetBreakdown = getEmberView(element.id);
    if (!budgetBreakdown) return;

    $('#total-upcoming', $budgetBreakdownMonthlyTotals).remove();
    $('#total-cc-payments', $budgetBreakdownMonthlyTotals).remove();
    $('#total-available-after-upcoming', $budgetBreakdownMonthlyTotals).remove();
    $('#available-after-upcoming-hr', $budgetBreakdownMonthlyTotals).remove();

    // When one category is selected, YNAB provides their own "Available After Upcoming" so we don't need ours.
    if (this.ynabAvailableAfterUpcomingExists($budgetBreakdownMonthlyTotals)) return;

    const totalAvailable = ynabToolKit.options.ShowAvailableAfterSavings
      ? budgetBreakdown.budgetTotals.available - getTotalSavings(budgetBreakdown)
      : budgetBreakdown.budgetTotals.available;
    const totalUpcoming = this.getTotalUpcoming(budgetBreakdown);
    const totalCCPayments = this.getTotalOfCCPayments(budgetBreakdown);
    let totalAvailableAfterUpcoming = totalAvailable + totalUpcoming;

    let $elements = $();

    const totalUpcomingElement = createBudgetBreakdownElement(
      'total-upcoming',
      'toolkit.totalUpcoming',
      'Total of Upcoming Transactions',
      totalUpcoming
    );
    $elements = $elements.add(totalUpcomingElement);

    if (this.settings.enabled !== 'no-cc') {
      totalAvailableAfterUpcoming -= totalCCPayments;

      const totalCCPaymentsElement = createBudgetBreakdownElement(
        'total-cc-payments',
        'toolkit.totalCCPayments',
        'Total of CC Payments',
        totalCCPayments
      );
      $elements = $elements.add(totalCCPaymentsElement);
    }

    if (totalAvailableAfterUpcoming === totalAvailable) return;

    const availableAfterUpcomingElement = createBudgetBreakdownElement(
      'total-available-after-upcoming',
      'toolkit.availableAfterUpcoming',
      'Available After Upcoming Transactions',
      totalAvailableAfterUpcoming
    );
    $elements = $elements.add(availableAfterUpcomingElement);

    $elements = $elements.add(
      '<div id="available-after-upcoming-hr"><hr style="width:100%"></div>'
    );

    const $ynabBreakdown = $('.ynab-breakdown', $budgetBreakdownMonthlyTotals);

    if (ynabToolKit.options.ShowAvailableAfterSavings)
      $elements.insertAfter('#total-available-after-savings');
    else $elements.prependTo($ynabBreakdown);
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

    return totalUpcoming;
  }

  getTotalOfCCPayments(budgetBreakdown) {
    let totalOfCCPayments = 0;

    for (const category of budgetBreakdown.inspectorCategories) {
      if (category.isCreditCardPaymentCategory)
        totalOfCCPayments += category.available + category.upcomingTransactions;
    }

    return totalOfCCPayments;
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}

export function createBudgetBreakdownElement(elementId, l10nKey, l10nDefault, amount) {
  const title = l10n(l10nKey, l10nDefault);

  const currencyClass = getCurrencyClass(amount);
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

function getCurrencyClass(amount) {
  let currencyClass = 'positive';

  if (amount < 0) {
    currencyClass = 'negative';
  } else if (amount === 0) {
    currencyClass = 'zero';
  }

  return currencyClass;
}
