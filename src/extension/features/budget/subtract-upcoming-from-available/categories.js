import { getAllBudgetMonthsViewModel } from 'toolkit/extension/utils/ynab';

export function getCategoriesObject() {
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
    const categoryMonthKey = getYearMonthKey(category.month);
    const categoryId = category.subCategory.entityId;
    const categoryData = {
      available: category.balance,
      upcoming: category.upcomingTransactions,
      availableAfterUpcoming: category.balance + category.upcomingTransactions,
      previousUpcoming: category.upcomingTransactions,
      availableAfterPreviousUpcoming: category.balance + category.upcomingTransactions,
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
    const previousMonthKey = getYearMonthKey(categoryMonth.month.clone().addMonths(-1));
    const previousMonthCategories = categoriesObject[previousMonthKey].categories;

    for (const [categoryId, categoryData] of Object.entries(categoryMonth.categories)) {
      const previousMonthCategoryData = previousMonthCategories[categoryId];

      categoryData.previousUpcoming += previousMonthCategoryData.previousUpcoming;
      categoryData.availableAfterPreviousUpcoming =
        categoryData.available + categoryData.previousUpcoming;
      categoriesObject[categoryMonthKey].categories[categoryId] = categoryData;
    }
  }

  return categoriesObject;
}

export function getCategoryData(categoriesObject, monthObject, categoryId) {
  const categoryMonthKey = getYearMonthKey(monthObject);
  const categoryMonth = categoriesObject[categoryMonthKey];
  return categoryMonth ? categoryMonth.categories[categoryId] : undefined;
}

export function getYearMonthKey(monthObject) {
  const year = monthObject.getYear();
  const month = monthObject.getMonth();
  return Number(`${year}${month}`);
}
