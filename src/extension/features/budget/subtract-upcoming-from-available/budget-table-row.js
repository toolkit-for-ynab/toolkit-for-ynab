import { formatCurrency, getCurrencyClass } from 'toolkit/extension/utils/currency';
import * as categories from './categories';
import { setCategoryOriginalValues } from './destroy-helpers';
import { shouldRun } from './index';
import { getBudgetMonthDisplaySubCategory } from '../utils';

export function handleBudgetTableRows() {
  if (!shouldRun()) return;
  $('.budget-table-row').each((_, element) => {
    const $categoryObjects = getCategoryObjects(element);
    if (!$categoryObjects) return;

    const category = getBudgetMonthDisplaySubCategory(element.dataset.entityId);
    if (!category) return;

    const categoryData = categories.setAndGetCategoryData(category);
    if (!categoryData) return;

    categoryValues(categoryData, category, $categoryObjects);
  });
}

function categoryValues(categoryData, category, $categoryObjects) {
  // Save values before they're changed so we can revert everything on destroy().
  setCategoryOriginalValues(category.categoryId, $categoryObjects);

  const values = {
    $categoryObjects,
    removeClasses: ['upcoming', 'positive', 'zero', 'negative'],
    addClasses: [getCurrencyClass(categoryData.availableAfterUpcoming)],
    text: formatCurrency(categoryData.availableAfterUpcoming),
    $upcomingIcon: null,
  };

  // If a category is overspent but upcoming transactions makes the available amount positive, add cautious so the user knowns its overspent.
  if (category.isOverSpent && categoryData.availableAfterUpcoming >= 0)
    values.addClasses.push('cautious');
  else if (!category.isOverSpent) values.removeClasses.push('cautious');

  setCategoryValues(values);
}

export function setCategoryValues(values) {
  const $categoryObjects = values.$categoryObjects;
  const $available = $categoryObjects.$available;
  const $availableText = $categoryObjects.$availableText;

  $available.removeClass(values.removeClasses);
  $availableText.removeClass(values.removeClasses);

  $available.addClass(values.addClasses);
  $availableText.addClass(values.addClasses);

  $availableText.text(values.text);

  // Remove icon by default. If $upcomingIcon is provided, we add it.
  if (!values.$upcomingIcon) $available.children('svg.icon-upcoming').remove();
  else values.$upcomingIcon.prependTo($available);
}

function getCategoryObjects(context) {
  const $available = $('.ynab-new-budget-available-number', context);
  if (!$available.length) return;

  const $availableText = $('.user-data', $available);
  if (!$availableText.length) return;

  return {
    $available,
    $availableText,
  };
}
