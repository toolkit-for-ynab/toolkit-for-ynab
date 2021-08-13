import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getEmberView } from 'toolkit/extension/utils/ember';
import * as categories from './categories';
import * as util from './util';

export function handleBudgetTableRow(element) {
  if (!util.shouldRun()) return;

  const category = getEmberView(element.id, 'category');
  if (!category) return;

  const categoryData = categories.setAndGetCategoryData(category);
  if (!categoryData) return;

  updateCategoryAvailableBalance(categoryData, category, element);
}

function updateCategoryAvailableBalance(categoryData, category, context) {
  const $available = $(`.ynab-new-budget-available-number`, context);
  const $availableText = $(`.user-data`, $available);

  $availableText.text(formatCurrency(categoryData.availableAfterUpcoming));

  $available.children('svg.icon-upcoming').remove();

  const classes = 'upcoming positive zero negative';
  $available.removeClass(classes);
  $availableText.removeClass(classes);

  const currencyClass = util.getCurrencyClass(categoryData.availableAfterUpcoming);
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
