/* eslint-disable no-continue */
import { getAllBudgetMonthsViewModel, getSelectedMonth } from 'toolkit/extension/utils/ynab';

const categoriesObject = {};
/*
categoriesObject = {
  [categoryMonthKey]: {
    month, // ynab month object
    categories: {
      [categoryId]: {
        available,
        upcoming,
        availableAfterUpcoming,
        previousUpcoming,
      }
    }
  }
}
*/

// Set categoryData on the individual category that was updated.
export function setAndGetCategoryData(category) {
  if (!isRelevantCategory(category)) return;

  const monthObject = category.budgetMonth;
  const categoryMonthKey = getYearMonthKey(monthObject);
  const categoryMonth = categoriesObject[categoryMonthKey];
  const categoryId = category.subCategory.entityId;
  const categoryDataExists = categoryMonth && categoryMonth.categories[categoryId];

  // If category is relevant but the month or data doesn't already exist, completely rebuild categoriesObject.
  if (!categoryMonth || !categoryDataExists) {
    console.log('Rebuilding!');
    setCategoriesObject();
    return categoriesObject[categoryMonthKey].categories[categoryId];
  }

  const categoryData = {
    available: category.available,
    upcoming: category.upcomingTransactions,
    availableAfterUpcoming: category.available + category.upcomingTransactions,
    previousUpcoming: 0,
  };

  categoriesObject[categoryMonthKey].categories[categoryId] = categoryData;
  setPreviousUpcoming(categoryId);

  return categoriesObject[categoryMonthKey].categories[categoryId];
}

// Get totals for selected month.
export function getTotals(inspectorCategories) {
  const selectedCategoryMonthKey = getYearMonthKey(getSelectedMonth());
  const selectedCategoryMonth = categoriesObject[selectedCategoryMonthKey];
  if (!selectedCategoryMonth) return;

  const totals = {
    totalPreviousUpcoming: 0,
    totalUpcoming: 0,
    totalCCPayments: 0,
    totalSavings: 0,
  };

  const filteredInspectorCategories = inspectorCategories.filter((category) => {
    return isRelevantCategory(category);
  });

  for (const category of filteredInspectorCategories) {
    const categoryData = selectedCategoryMonth.categories[category.subCategory.entityId];

    totals.totalPreviousUpcoming += categoryData.previousUpcoming;
    totals.totalUpcoming += categoryData.upcoming;
    if (category.isCreditCardPaymentCategory)
      totals.totalCCPayments += categoryData.availableAfterUpcoming;
    if (isSavingsCategory(category)) totals.totalSavings += categoryData.availableAfterUpcoming;
  }

  totals.totalCCPayments = totals.totalCCPayments < 0 ? 0 : totals.totalCCPayments;
  totals.totalSavings = totals.totalSavings < 0 ? 0 : totals.totalSavings;

  return totals;
}

const relevantCategorySet = new Set();

// Returns an object that has all the relevant data we need to update each category's available balance and the budget breakdown.
export function setCategoriesObject() {
  const allBudgetMonthsViewModel = getAllBudgetMonthsViewModel();
  if (!allBudgetMonthsViewModel) return;

  const categoryCalculationsCollection =
    allBudgetMonthsViewModel.monthlySubCategoryBudgetCalculationsCollection;
  if (!categoryCalculationsCollection) return;

  const categoriesArray = categoryCalculationsCollection._internalDataArray;

  // relevantCategorySet is a set of category IDs that either have upcoming transactions at some point, are CC categories, or are savings categories.
  for (const category of categoriesArray) {
    if (isRelevantCategory(category)) relevantCategorySet.add(category.subCategory.entityId);
  }
  if (!relevantCategorySet.size) return;

  const currentMonth = ynab.utilities.DateWithoutTime.createForCurrentMonth();

  // Create array of relevant categories from current month and beyond.
  const filteredCategoriesArray = categoriesArray.filter((category) => {
    const isInCurrentMonthOrLater = !category.month.isBeforeMonth(currentMonth);
    return isInCurrentMonthOrLater && isRelevantCategory(category);
  });

  // Build categoriesObject.
  for (const category of filteredCategoriesArray) {
    const categoryMonthKey = getYearMonthKey(category.month);
    const categoryId = category.subCategory.entityId;
    const categoryData = {
      available: category.balance,
      upcoming: category.upcomingTransactions,
      availableAfterUpcoming: category.balance + category.upcomingTransactions,
      previousUpcoming: 0,
    };

    categoriesObject[categoryMonthKey] = categoriesObject[categoryMonthKey] || {
      month: category.month,
      categories: {
        [categoryId]: categoryData,
      },
    };
  }

  setPreviousUpcoming();
}

// For each category, add together previous month's upcomingTransactions and previous upcomingTransactions (that is, the previous, previous month's upcomingTransactions).
// We store the total sum of all previous months' upcomingTransactions as previousUpcoming.
// This is done starting from currentMonth + 1, that way we are "stacking" upcomingTransactions correctly.
// We slice(1) because the first element (current month) has no previous month.
function setPreviousUpcoming(optionalCategoryId) {
  for (const [categoryMonthKey, categoryMonth] of Object.entries(categoriesObject).slice(1)) {
    const previousCategoryMonthKey = getYearMonthKey(categoryMonth.month.clone().addMonths(-1));
    const previousCategoryMonth = categoriesObject[previousCategoryMonthKey];
    if (!previousCategoryMonth) continue;

    const categoryMonthCategories = categoryMonth.categories;
    const previousCategoryMonthCategories = previousCategoryMonth.categories;
    for (let [categoryId, categoryData] of Object.entries(categoryMonthCategories)) {
      // If passed optionalCategoryId, only update amounts for that category.
      const optionalCategoryData = categoryMonthCategories[optionalCategoryId];
      categoryId = optionalCategoryData ? optionalCategoryId : categoryId;
      categoryData = optionalCategoryData || categoryData;

      const previousCategoryData = previousCategoryMonthCategories[categoryId];

      categoryData.previousUpcoming +=
        previousCategoryData.previousUpcoming + previousCategoryData.upcoming;
      categoryData.availableAfterUpcoming =
        categoryData.available + categoryData.previousUpcoming + categoryData.upcoming;
      categoriesObject[categoryMonthKey].categories[categoryId] = categoryData;

      if (optionalCategoryData) break;
    }
  }
}

function isRelevantCategory(category) {
  if (relevantCategorySet.has(category.subCategory.entityId)) return true;

  const hasUpcomingTransactions = category.upcomingTransactions;
  const isCCPaymentCategory = category.subCategory.isCreditCardPaymentCategory();

  return hasUpcomingTransactions || isCCPaymentCategory || isSavingsCategory(category);
}

function isSavingsCategory(category) {
  const masterCategoryName = category.subCategory.masterCategory.name;
  const categoryName = category.subCategory.name;

  return (
    masterCategoryName.toLowerCase().includes('savings') ||
    categoryName.toLowerCase().includes('savings')
  );
}

function getYearMonthKey(monthObject) {
  const year = monthObject.getYear();
  const month = monthObject.getMonth();
  return Number(`${year}${month}`);
}
