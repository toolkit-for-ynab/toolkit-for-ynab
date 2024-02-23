/* eslint-disable no-continue */
import { getAllBudgetMonthsViewModel } from 'toolkit/extension/utils/ynab';
import { getTotalSavings } from '../show-available-after-savings/index';

let categoriesObject = {};
/*
categoriesObject = {
  [categoryMonthKey]: {
    [categoryId]: {
      isSet,
      id, // subCategory.entityId
      month, // ynab month object
      available,
      upcoming,
      availableAfterUpcoming,
      previousUpcoming,
    }
  }
}
*/

// relevantCategorySet is a set of category IDs that either have upcoming transactions at some point, are CC categories, or are savings categories.
const relevantCategorySet = new Set();

// Set categoryData on the individual category that was rendered.
export function setAndGetCategoryData(category) {
  if (!isRelevantCategory(category)) return;

  // If category is relevant but the data doesn't already exist, completely rebuild categoriesObject.
  const categoryData = getCategoryData(category);
  if (!categoryData) {
    setCategoriesObject();
    return getCategoryData(category);
  }

  const newCategoryData = getInitialCategoryData(category);
  // Don't set categoryData if nothing changed.
  if (isCategoryDataEqual(categoryData, newCategoryData) && categoryData.isSet) return;

  setCategoryData(category, { isSet: true });
  setPreviousUpcoming();

  return getCategoryData(category);
}

// Get totals for selected month.
export function getTotals(inspectorCategories) {
  const totals = {
    totalPreviousUpcoming: 0,
    totalUpcoming: 0,
    totalCCPayments: 0,
    totalAvailable: 0,
    totalAvailableAfterUpcoming: 0,
  };

  const filteredInspectorCategories = inspectorCategories.filter((category) => {
    return isRelevantCategory(category);
  });

  const noCC = ynabToolKit.options.SubtractUpcomingFromAvailable === 'no-cc';

  for (const category of filteredInspectorCategories) {
    const categoryData = getCategoryData(category);
    if (!categoryData) continue;

    totals.totalPreviousUpcoming += categoryData.previousUpcoming;
    totals.totalUpcoming += categoryData.upcoming;
    totals.totalAvailable += categoryData.available;

    if (!noCC && category.isCreditCardPaymentCategory) {
      /*
      If available is less than 0, we ignore it because it will already have been subtracted from YNAB's total available.
      If availableAfterUpcoming is less than 0, we ignore it because that amount is already accounted for by the upcoming transactions.
      We use availableAfterUpcoming to avoid "double-dipping" in the totals calculation. e.g. if available is 100 and upcoming is 100, we only want to subtract 100 once (which we are via totalUpcoming).
      This also allows us to grab any remaining CC payment if available is greater than upcoming. e.g. if available is 150 and upcoming is 100, we still have a 50 CC payment to account for.
      Also, it is currently impossible in YNAB to have a positive upcoming transaction for a CC category, so we don't have to worry about having a negative available but a positive availableAfterUpcoming.
      */
      totals.totalCCPayments +=
        categoryData.available < 0 || categoryData.availableAfterUpcoming < 0
          ? 0
          : categoryData.availableAfterUpcoming;
    }
  }

  const totalSavings = ynabToolKit.options.ShowAvailableAfterSavings
    ? getTotalSavings(inspectorCategories)
    : 0;
  const totalAvailable = totals.totalAvailable - totalSavings;

  totals.totalAvailableAfterUpcoming =
    totalAvailable + totals.totalPreviousUpcoming + totals.totalUpcoming - totals.totalCCPayments;

  return totals.totalAvailableAfterUpcoming !== totalAvailable && totals;
}

// Build categoriesObject.
export function setCategoriesObject() {
  const allBudgetMonthsViewModel = getAllBudgetMonthsViewModel();
  if (!allBudgetMonthsViewModel) return;

  const categoryCalculationsCollection =
    allBudgetMonthsViewModel.monthlySubCategoryBudgetCalculationsCollection;
  if (!categoryCalculationsCollection) return;

  const categoriesArray = categoryCalculationsCollection.collectionItems;
  if (!categoriesArray) return;

  relevantCategorySet.clear();
  for (const category of categoriesArray) {
    if (isRelevantCategory(category)) relevantCategorySet.add(category.subCategory.entityId);
  }
  if (!relevantCategorySet.size) return;

  const currentMonth = ynab.utilities.DateWithoutTime.createForCurrentMonth();

  // Create array of relevant categories from current month and beyond.
  const filteredCategoriesArray = categoriesArray.filter((category) => {
    const isInCurrentMonthOrLater = !getCategoryMonthObject(category).isBeforeMonth(currentMonth);
    return isInCurrentMonthOrLater && isRelevantCategory(category);
  });

  categoriesObject = {};
  for (const category of filteredCategoriesArray) {
    const categoryMonthKey = getCategoryMonthKey(category);
    categoriesObject[categoryMonthKey] = categoriesObject[categoryMonthKey] || {};
    setCategoryData(category);
  }

  setPreviousUpcoming();
}

// Any of the below get/set functions take either a YNAB category or categoryData.

/*
For each category, add together previous month's upcoming transactions and previous month's previous upcoming transactions.
(That is, the previous, previous month's upcoming transactions.)
We store the sum of the previous month's upcoming and previous upcoming transactions as previousUpcoming.
In other words, a given category's previousUpcoming is the sum of the previous month's category's upcoming and previousUpcoming. 
This is done starting from currentMonth + 1, that way we are "stacking" upcomingTransactions correctly.
We slice(1) because the first element (current month) has no previous month.
*/
function setPreviousUpcoming() {
  for (const categoryMonthData of Object.values(categoriesObject).slice(1)) {
    for (const categoryData of Object.values(categoryMonthData)) {
      const previousCategoryData = getCategoryData(categoryData, -1);
      if (!previousCategoryData) return;

      const newCategoryData = getCategoryData(categoryData);

      newCategoryData.previousUpcoming =
        previousCategoryData.previousUpcoming + previousCategoryData.upcoming;
      newCategoryData.availableAfterUpcoming =
        newCategoryData.available + newCategoryData.previousUpcoming + newCategoryData.upcoming;

      setCategoryData(categoryData, newCategoryData);
    }
  }
}

function getInitialCategoryData(category) {
  const available = category.balance || category.available || 0;
  const upcoming = category.upcomingTransactions || category.upcoming || 0;
  const availableAfterUpcoming = available + upcoming;

  return {
    isSet: false,
    id: getCategoryId(category),
    month: getCategoryMonthObject(category),
    available,
    upcoming,
    availableAfterUpcoming,
    previousUpcoming: 0,
  };
}

// Optionally provide addMonths which is an integer. If provided, returns the categoryData at the category's month + addMonths. Otherwise the month on category is used.
function getCategoryData(category, addMonths) {
  if (!isValidCategoryOrCategoryData(category)) return;

  const categoryMonthKey = getValidCategoryMonthKey(category, addMonths);
  if (!categoryMonthKey) return;
  const categoryId = getCategoryId(category);

  return categoriesObject[categoryMonthKey][categoryId];
}

// Optionally provide categoryData which can contain any number of valid keys.
function setCategoryData(category, categoryData) {
  if (!isValidCategoryOrCategoryData(category)) return;

  const categoryMonthKey = getValidCategoryMonthKey(category);
  if (!categoryMonthKey) return;
  const categoryId = getCategoryId(category);

  const newCategoryData = getInitialCategoryData(category);
  if (categoryData) {
    for (const [key, value] of Object.entries(categoryData)) {
      newCategoryData[key] = value;
    }
  }

  categoriesObject[categoryMonthKey][categoryId] = newCategoryData;
}

// Only returns a categoryMonthKey if it exists on categoriesObject.
function getValidCategoryMonthKey(category, addMonths) {
  const categoryMonthKey = getCategoryMonthKey(category, addMonths);
  return categoriesObject[categoryMonthKey] && categoryMonthKey;
}

// Optionally provide addMonths which is an integer. If provided, returns the categoryData at the category's month + addMonths. Otherwise the month on category is used.
function getCategoryMonthKey(category, addMonths) {
  if (!isValidCategoryOrCategoryData(category)) return;
  if (addMonths && typeof addMonths !== 'number') return;

  const monthObject = addMonths
    ? getCategoryMonthObject(category).clone().addMonths(addMonths)
    : getCategoryMonthObject(category);
  if (!monthObject) return;

  const year = monthObject.getYear();
  const month = monthObject.getMonth();
  const categoryMonthKey = Number(`${year}${month}`);

  return categoryMonthKey;
}

function getCategoryMonthObject(category) {
  if (!isValidCategoryOrCategoryData(category)) return;
  return category.budgetMonth || category.month;
}

function getCategoryId(category) {
  if (!isValidCategoryOrCategoryData(category)) return;
  return category.subCategory ? category.subCategory.entityId : category.id;
}

function isValidCategoryOrCategoryData(category) {
  return isValidCategory(category) || isValidCategoryData(category);
}

function isValidCategory(category) {
  return category && category.subCategory && true;
}

function isRelevantCategory(category) {
  if (!isValidCategory(category)) return false;

  if (relevantCategorySet.has(getCategoryId(category))) return true;

  const hasUpcomingTransactions = category.upcomingTransactions;
  const isCCPaymentCategory = category.subCategory.isCreditCardPaymentCategory();

  return (hasUpcomingTransactions || isCCPaymentCategory || isSavingsCategory(category)) && true;
}

export function isSavingsCategory(category) {
  if (!isValidCategory(category)) return false;

  const masterCategoryName = category.subCategory.masterCategory.name;
  const categoryName = category.subCategory.name;
  const isCCPaymentCategory = category.subCategory.isCreditCardPaymentCategory();

  return (
    (masterCategoryName.toLowerCase().includes('savings') ||
      categoryName.toLowerCase().includes('savings')) &&
    !isCCPaymentCategory &&
    true
  );
}

function isValidCategoryData(categoryData) {
  const validKeys = [
    'isSet',
    'id',
    'month',
    'available',
    'upcoming',
    'availableAfterUpcoming',
    'previousUpcoming',
  ];
  return validKeys.every((key) => {
    return Object.prototype.hasOwnProperty.call(categoryData, key);
  });
}

function isCategoryDataEqual(categoryData1, categoryData2) {
  if (!isValidCategoryData(categoryData1) || !isValidCategoryData(categoryData2)) return false;

  const isAvailableEqual = categoryData1.available === categoryData2.available;
  const isUpcomingEqual = categoryData1.upcoming === categoryData2.upcoming;
  return isAvailableEqual && isUpcomingEqual;
}
