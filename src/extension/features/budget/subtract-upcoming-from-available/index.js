import { Feature } from 'toolkit/extension/features/feature';
import {
  isCurrentRouteBudgetPage,
  getAllBudgetMonthsViewModel,
  getSelectedMonth,
} from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { addToolkitEmberHook, l10n } from 'toolkit/extension/utils/toolkit';
import { getTotalSavings } from 'toolkit/extension/features/budget/show-available-after-savings/index';

// TODO
// Adjust cash left over amount.
// Change getCategoriesObject to not change upcoming and handle that later.

export class SubtractUpcomingFromAvailable extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    addToolkitEmberHook(this, 'budget-table-row', 'didRender', this.handleBudgetTableRow);
    addToolkitEmberHook(this, 'budget-breakdown', 'didRender', this.handleBudgetBreakdown);
  }

  handleBudgetTableRow(element) {
    if (!this.shouldInvoke()) return;

    const category = getEmberView(element.id, 'category');
    if (category) this.updateCategoryAvailableBalance(category, element);
  }

  handleBudgetBreakdown(element) {
    if (!this.shouldInvoke()) return;

    const $budgetBreakdownMonthlyTotals = $('.budget-breakdown-monthly-totals', element);
    const $budgetBreakdownAvailableBalance = $('.budget-breakdown-available-balance', element);
    const $budgetBreakdownTotals = $budgetBreakdownMonthlyTotals.length
      ? $budgetBreakdownMonthlyTotals
      : $budgetBreakdownAvailableBalance.length
      ? $budgetBreakdownAvailableBalance
      : undefined;
    const budgetBreakdown = getEmberView(element.id);
    if ($budgetBreakdownTotals && budgetBreakdown)
      this.addTotalAvailableAfterUpcoming(budgetBreakdown, $budgetBreakdownTotals);
  }

  updateCategoryAvailableBalance(category, context) {
    const categoryData = this.getCategoryData(
      this.getCategoriesObject(),
      getSelectedMonth(),
      category.categoryId
    );
    if (!categoryData) return;

    const $available = $(`.ynab-new-budget-available-number`, context);
    const $availableText = $(`.user-data`, $available);

    $availableText.text(formatCurrency(categoryData.availableAfterUpcoming));

    $available.children('svg.icon-upcoming').remove();

    const classes = 'upcoming positive zero negative';
    $available.removeClass(classes);
    $availableText.removeClass(classes);

    const currencyClass = getCurrencyClass(categoryData.availableAfterUpcoming);
    $available.addClass(currencyClass);
    $availableText.addClass(currencyClass);

    if (categoryData.availableAfterUpcoming >= 0) {
      $(category).removeAttr('data-toolkit-negative-available');

      if (category.isOverSpent) {
        $available.addClass('cautious');
        $availableText.addClass('cautious');
      }
    } else if (!category.isOverSpent) {
      $available.removeClass('cautious');
      $availableText.removeClass('cautious');
    }
  }

  addTotalAvailableAfterUpcoming(budgetBreakdown, context) {
    $('#total-previous-upcoming', context).remove();
    $('#total-upcoming', context).remove();
    $('#total-cc-payments', context).remove();
    $('#total-available-after-upcoming', context).remove();
    $('#available-after-upcoming-hr', context).remove();

    const categoriesObject = this.getCategoriesObject();

    const totalAvailable = ynabToolKit.options.ShowAvailableAfterSavings
      ? budgetBreakdown.budgetTotals.available - getTotalSavings(budgetBreakdown)
      : budgetBreakdown.budgetTotals.available;
    const totalPreviousUpcoming = this.getTotalPreviousUpcoming(budgetBreakdown, categoriesObject);
    const totalUpcoming = this.getTotalUpcoming(budgetBreakdown, categoriesObject);
    let totalAvailableAfterUpcoming = totalAvailable + totalPreviousUpcoming + totalUpcoming;

    // When one category is selected, YNAB provides its own "Available After Upcoming" so we edit that instead of adding ours.
    const $ynabAvailableAfterUpcoming = this.getYnabAvailableAfterUpcoming(context);
    if ($ynabAvailableAfterUpcoming)
      this.editYnabAvailableAfterUpcoming(
        totalAvailableAfterUpcoming,
        $ynabAvailableAfterUpcoming,
        context
      );

    let $elements = $();

    const $totalPreviousUpcoming = createBudgetBreakdownEntry(
      'total-previous-upcoming',
      'toolkit.totalPreviousUpcoming',
      'Upcoming Transactions (Previous Months)',
      totalPreviousUpcoming
    );
    $elements = $elements.add($totalPreviousUpcoming);

    const $totalUpcoming = createBudgetBreakdownEntry(
      'total-upcoming',
      'toolkit.totalUpcoming',
      'Upcoming Transactions (This Month)',
      totalUpcoming
    );
    $elements = $elements.add($totalUpcoming);

    if (this.settings.enabled !== 'no-cc') {
      const totalCCPayments = this.getTotalCCPayments(budgetBreakdown);
      totalAvailableAfterUpcoming -= totalCCPayments;

      const $totalCCPayments = createBudgetBreakdownEntry(
        'total-cc-payments',
        'toolkit.totalCCPayments',
        'CC Payments',
        -totalCCPayments // Invert amount. A positive amount should show as negative in the budget breakdown and vice versa.
      );
      $elements = $elements.add($totalCCPayments);
    }

    if (totalAvailableAfterUpcoming === totalAvailable) return;

    const $availableAfterUpcoming = createBudgetBreakdownEntry(
      'total-available-after-upcoming',
      'toolkit.availableAfterUpcoming',
      'Available After Upcoming Transactions',
      totalAvailableAfterUpcoming
    );
    $elements = $elements.add($availableAfterUpcoming);

    $elements = $elements.add(
      '<div id="available-after-upcoming-hr"><hr style="width:100%"></div>'
    );

    const $totalAvailableAfterSavings = $('#total-available-after-savings');
    const $ynabBreakdown = $('.ynab-breakdown', context);

    if (ynabToolKit.options.ShowAvailableAfterSavings && $totalAvailableAfterSavings.length)
      $elements.insertAfter($totalAvailableAfterSavings);
    else $elements.prependTo($ynabBreakdown);
  }

  getYnabAvailableAfterUpcoming(context) {
    const localizedMessageText = l10n(
      'inspector.availableMessage.afterUpcoming',
      'Available After Upcoming'
    );

    const $ynabAvailableAfterUpcoming = $('.inspector-message-label', context).filter(function () {
      return this.innerText === localizedMessageText;
    });

    return $ynabAvailableAfterUpcoming.length ? $ynabAvailableAfterUpcoming : false;
  }

  editYnabAvailableAfterUpcoming(amount, $ynabAvailableAfterUpcoming, context) {
    const $inspectorMessageRow = $($ynabAvailableAfterUpcoming, context).parent();

    const classes = 'positive zero negative';

    const $inspectorMessage = $($inspectorMessageRow, context).parent();
    $inspectorMessage.removeClass(classes);
    $inspectorMessage.addClass(amount >= 0 ? 'positive' : 'negative');

    const $availableAfterUpcomingText = $('.user-data', $inspectorMessageRow);
    $availableAfterUpcomingText.text(formatCurrency(amount));
    $availableAfterUpcomingText.removeClass(classes);
    $availableAfterUpcomingText.addClass(getCurrencyClass(amount));
  }

  getTotalUpcoming(budgetBreakdown, categoriesObject) {
    let totalUpcoming = 0;

    const selectedMonth = getSelectedMonth();

    for (const category of budgetBreakdown.inspectorCategories) {
      const categoryData = this.getCategoryData(
        categoriesObject,
        selectedMonth,
        category.categoryId
      );
      if (categoryData) totalUpcoming += categoryData.upcoming;
    }

    return totalUpcoming;
  }

  getTotalCCPayments(budgetBreakdown) {
    let totalCCPayments = 0;

    for (const category of budgetBreakdown.inspectorCategories) {
      if (category.isCreditCardPaymentCategory)
        totalCCPayments += category.available + category.upcomingTransactions;
    }

    if (totalCCPayments < 0) return 0;
    return totalCCPayments;
  }

  getCategoriesObject() {
    const allBudgetMonthsViewModel = getAllBudgetMonthsViewModel();
    if (!allBudgetMonthsViewModel) return;

    const categoryCalculationsCollection = allBudgetMonthsViewModel.get(
      'monthlySubCategoryBudgetCalculationsCollection'
    );
    if (!categoryCalculationsCollection) return;

    const categoriesArray = categoryCalculationsCollection._internalDataArray;

    // Create array of category IDs that have upcoming transactions.
    const categoryIdsWithUpcomingTransactions = [];
    for (const category of categoriesArray) {
      if (category.upcomingTransactions)
        categoryIdsWithUpcomingTransactions.push(category.subCategory.entityId);
    }
    if (!categoryIdsWithUpcomingTransactions.length) return;

    const currentMonth = ynab.utilities.DateWithoutTime.createForCurrentMonth();

    // Create array of categories from current month and beyond where the category has an upcoming transaction at some point.
    const filteredCategoriesArray = categoriesArray.filter((category) => {
      const isInCurrentMonthOrLater = !category.month.isBeforeMonth(currentMonth);
      const hasUpcomingTransactionAtSomePoint = categoryIdsWithUpcomingTransactions.includes(
        category.subCategory.entityId
      );
      return isInCurrentMonthOrLater && hasUpcomingTransactionAtSomePoint;
    });

    const categoriesObject = {};
    /*
    categoriesObject = {
      categoryMonthKey: {
        month: category.month,
        categories: {
          categoryId: categoryData
        }
      }
    }
    */

    // Build categoriesObject.
    for (const category of filteredCategoriesArray) {
      const categoryMonthKey = this.getYearMonthKey(category.month);
      const categoryId = category.subCategory.entityId;
      const categoryData = {
        available: category.balance,
        upcoming: category.upcomingTransactions,
        availableAfterUpcoming: category.balance + category.upcomingTransactions,
      };

      categoriesObject[categoryMonthKey] = categoriesObject[categoryMonthKey] || {
        month: category.month,
        categories: {},
      };
      categoriesObject[categoryMonthKey].categories[categoryId] = categoryData;
    }

    // For each category, add previous month's upcomingTransactions to current month's and calculate availableAfterUpcoming.
    // We slice(1) because the first element (current month) has no previous month.
    for (const [categoryMonthKey, categoryMonth] of Object.entries(categoriesObject).slice(1)) {
      const previousMonthKey = this.getYearMonthKey(categoryMonth.month.clone().addMonths(-1));
      const previousMonthCategories = categoriesObject[previousMonthKey].categories;

      for (const [categoryId, categoryData] of Object.entries(categoryMonth.categories)) {
        const previousMonthCategoryData = previousMonthCategories[categoryId];

        categoryData.upcoming += previousMonthCategoryData.upcoming;
        categoryData.availableAfterUpcoming = categoryData.available + categoryData.upcoming;
        categoriesObject[categoryMonthKey].categories[categoryId] = categoryData;
      }
    }

    return categoriesObject;
  }

  getCategoryData(categoriesObject, monthObject, categoryId) {
    const categoryMonthKey = this.getYearMonthKey(monthObject);
    const categoryMonth = categoriesObject[categoryMonthKey];
    return categoryMonth ? categoryMonth.categories[categoryId] : undefined;
  }

  getYearMonthKey(monthObject) {
    const year = monthObject.getYear();
    const month = monthObject.getMonth();
    return Number(`${year}${month}`);
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}

export function createBudgetBreakdownEntry(elementId, l10nKey, l10nDefault, amount) {
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
