import { getSelectedMonth } from 'toolkit/extension/utils/ynab';
import * as categories from 'toolkit/extension/features/budget/subtract-upcoming-from-available/categories';

export function getTotalPreviousUpcoming(budgetBreakdown, categoriesObject) {
  for (const [categoryMonthKey, categoryMonth] of Object.entries(categoriesObject).slice(1)) {
    const previousMonthKey = categories.getYearMonthKey(categoryMonth.month.clone().addMonths(-1));
    const previousMonthCategories = categoriesObject[previousMonthKey].categories;

    for (const [categoryId, categoryData] of Object.entries(categoryMonth.categories)) {
      const previousMonthCategoryData = previousMonthCategories[categoryId];

      categoryData.upcoming += previousMonthCategoryData.upcoming;
      categoryData.availableAfterUpcoming = categoryData.available + categoryData.upcoming;
      categoriesObject[categoryMonthKey].categories[categoryId] = categoryData;
    }
  }

  let totalUpcoming = 0;

  const selectedMonth = getSelectedMonth();

  for (const category of budgetBreakdown.inspectorCategories) {
    const categoryData = categories.getCategoryData(
      categoriesObject,
      selectedMonth,
      category.categoryId
    );
    if (categoryData) totalUpcoming += categoryData.upcoming;
  }

  return totalUpcoming;
}

export function getTotalUpcoming(budgetBreakdown, categoriesObject) {
  let totalUpcoming = 0;

  const selectedMonth = getSelectedMonth();

  for (const category of budgetBreakdown.inspectorCategories) {
    const categoryData = categories.getCategoryData(
      categoriesObject,
      selectedMonth,
      category.categoryId
    );
    if (categoryData) totalUpcoming += categoryData.upcoming;
  }

  return totalUpcoming;
}

export function getTotalCCPayments(budgetBreakdown) {
  let totalCCPayments = 0;

  for (const category of budgetBreakdown.inspectorCategories) {
    if (category.isCreditCardPaymentCategory)
      totalCCPayments += category.available + category.upcomingTransactions;
  }

  if (totalCCPayments < 0) return 0;
  return totalCCPayments;
}
