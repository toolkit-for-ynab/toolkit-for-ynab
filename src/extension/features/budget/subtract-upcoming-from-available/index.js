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

    const category = getEmberView(element.id, 'category');
    if (category) this.updateCategoryAvailableBalance(category, element);

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
    const categoryData = this.getCategoryData(getSelectedMonth(), category.categoryId);
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

  getCategoryData(monthObject, categoryId) {
    const categoriesObject = this.getCategoriesObject();
    const categoryMonthKey = this.getYearMonthKey(monthObject);
    const categoryMonth = categoriesObject[categoryMonthKey];
    return categoryMonth ? categoryMonth.categories[categoryId] : undefined;
  }

  getYearMonthKey(monthObject) {
    const year = monthObject.getYear();
    const month = monthObject.getMonth();
    return Number(`${year}${month}`);
  }

  addTotalAvailableAfterUpcoming(budgetBreakdown, context) {
    $('#total-upcoming', context).remove();
    $('#total-cc-payments', context).remove();
    $('#total-available-after-upcoming', context).remove();
    $('#available-after-upcoming-hr', context).remove();

    const totalAvailable = ynabToolKit.options.ShowAvailableAfterSavings
      ? budgetBreakdown.budgetTotals.available - getTotalSavings(budgetBreakdown)
      : budgetBreakdown.budgetTotals.available;
    const totalUpcoming = this.getTotalUpcoming(budgetBreakdown);
    const totalCCPayments = this.getTotalCCPayments(budgetBreakdown);
    let totalAvailableAfterUpcoming = totalAvailable + totalUpcoming;

    // When one category is selected, YNAB provides its own "Available After Upcoming" so we edit that instead of adding ours.
    if (this.ynabAvailableAfterUpcomingEdited(totalAvailableAfterUpcoming, context)) return;

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
        -totalCCPayments // Invert amount. A positive amount should show as negative in the budget breakdown and vice versa.
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

    const $totalAvailableAfterSavings = $('#total-available-after-savings');
    const $ynabBreakdown = $('.ynab-breakdown', context);

    if (ynabToolKit.options.ShowAvailableAfterSavings && $totalAvailableAfterSavings.length)
      $elements.insertAfter($totalAvailableAfterSavings);
    else $elements.prependTo($ynabBreakdown);
  }

  ynabAvailableAfterUpcomingEdited(amount, context) {
    const localizedMessageText = l10n(
      'inspector.availableMessage.afterUpcoming',
      'Available After Upcoming'
    );

    const $ynabAvailableAfterUpcoming = $('.inspector-message-label', context).filter(function () {
      return this.innerText === localizedMessageText;
    });
    if (!$ynabAvailableAfterUpcoming.length) return false;

    const $inspectorMessageRow = $($ynabAvailableAfterUpcoming, context).parent();

    const classes = 'positive zero negative';

    const $inspectorMessage = $($inspectorMessageRow, context).parent();
    $inspectorMessage.removeClass(classes);
    $inspectorMessage.addClass(amount >= 0 ? 'positive' : 'negative');

    const $availableAfterUpcomingText = $('.user-data', $inspectorMessageRow);
    $availableAfterUpcomingText.text(formatCurrency(amount));
    $availableAfterUpcomingText.removeClass(classes);
    $availableAfterUpcomingText.addClass(getCurrencyClass(amount));
    return true;
  }

  getTotalUpcoming(budgetBreakdown) {
    let totalUpcoming = 0;

    const selectedMonthKey = getSelectedMonth();

    for (const category of budgetBreakdown.inspectorCategories) {
      const categoryData = this.getCategoryData(selectedMonthKey, category.categoryId);
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
