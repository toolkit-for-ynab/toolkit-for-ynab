import { setInspectorMessageValues } from './budget-breakdown-available-balance';
import { setCategoryValues } from './budget-table-row';

// budget-breakdown-available-balance

export function resetInspectorMessage() {
  setInspectorMessageValues(inspectorMessageOriginalValues);
  $('#tk-inspector-message-previous-upcoming').remove();
  $('#tk-inspector-message-cc-payment').remove();
}

let inspectorMessageOriginalValues;

export function setInspectorMessageOriginalValues($inspectorMessageObjects) {
  const $inspectorMessageContainer = $inspectorMessageObjects.$inspectorMessageContainer;
  const $availableAfterUpcomingText = $inspectorMessageObjects.$availableAfterUpcomingText;

  const classes = ['positive', 'zero', 'negative'];

  inspectorMessageOriginalValues = {
    $inspectorMessageObjects,
    reset: true,
    removeClasses: classes,
    $inspectorMessageContainerClass: [],
    $availableAfterUpcomingText: $availableAfterUpcomingText.text(),
    $availableAfterUpcomingTextClass: [],
  };

  for (const currencyClass of classes) {
    if ($inspectorMessageContainer.hasClass(currencyClass))
      inspectorMessageOriginalValues.$inspectorMessageContainerClass.push(currencyClass);

    if ($availableAfterUpcomingText.hasClass(currencyClass))
      inspectorMessageOriginalValues.$availableAfterUpcomingTextClass.push(currencyClass);
  }
}

// budget-breakdown-monthly-totals

export function removeBudgetBreakdownEntries() {
  $('#tk-total-previous-upcoming').remove();
  $('#tk-total-upcoming').remove();
  $('#tk-total-cc-payments').remove();
  $('#tk-total-available-after-upcoming').remove();
  $('#tk-available-after-upcoming-hr').remove();
}

// budget-table-row

export function resetCategoryValues() {
  for (const values of Object.values(categoryOriginalValues)) {
    setCategoryValues(values);
  }
}

const categoryOriginalValues = {};

export function setCategoryOriginalValues(categoryId, $categoryObjects) {
  const $available = $categoryObjects.$available;
  const $availableText = $categoryObjects.$availableText;

  const classes = ['upcoming', 'positive', 'zero', 'negative', 'cautious'];

  categoryOriginalValues[categoryId] = {
    $categoryObjects,
    removeClasses: classes,
    addClasses: [],
    text: $availableText.text(),
    $upcomingIcon: null,
  };

  for (const currencyClass of classes) {
    if ($available.hasClass(currencyClass))
      categoryOriginalValues[categoryId].addClasses.push(currencyClass);
  }

  if ($available.children('svg.icon-upcoming').length)
    categoryOriginalValues[categoryId].$upcomingIcon = $available.children('svg.icon-upcoming');
}
