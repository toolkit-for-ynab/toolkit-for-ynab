// ==UserScript==
// @name Main
// @include http://*.youneedabudget.com/*
// @include https://*.youneedabudget.com/*
// ==/UserScript==

function injectCSS(path) {
  var link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('type', 'text/css');
  link.setAttribute('href', chrome.extension.getURL(path));

  document.getElementsByTagName('head')[0].appendChild(link);
}

function injectScript(path) {
  var script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', chrome.extension.getURL(path));

  document.getElementsByTagName('body')[0].appendChild(script);
}

function ensureDefaultsAreSet() {
  var storedKeys = kango.storage.getKeys();

  if (storedKeys.indexOf('collapseExpandBudgetGroups') < 0) {
    kango.storage.setItem('collapseExpandBudgetGroups', true);
  }

  if (storedKeys.indexOf('enableRetroCalculator') < 0) {
    kango.storage.setItem('enableRetroCalculator', true);
  }

  if (storedKeys.indexOf('removeZeroCategories') < 0) {
    kango.storage.setItem('removeZeroCategories', true);
  }
}

ensureDefaultsAreSet();

if (kango.storage.getItem('collapseExpandBudgetGroups')) {
  injectCSS('res/features/collapse-budget-groups/main.css');
  injectScript('res/features/collapse-budget-groups/main.js');
}

if (kango.storage.getItem('collapseSideMenu')) {
  injectCSS('features/collapse-side-menu/main.css');
  injectScript('features/collapse-side-menu/main.js');
}

if (kango.storage.getItem('colourBlindMode')) {
  injectCSS('features/colour-blind-mode/main.css');
}

if (kango.storage.getItem('hideAOM')) {
  injectCSS('features/hide-age-of-money/main.css');
}

if (kango.storage.getItem('highlightNegativesNegative')) {
  injectScript('features/highlight-negatives-negative/main.js');
}

if (kango.storage.getItem('checkCreditBalances')) {
  injectScript('features/check-credit-balances/main.js');
}

if (kango.storage.getItem('enableRetroCalculator')) {
  injectScript('features/ynab-4-calculator/main.js');
}

if (kango.storage.getItem('removeZeroCategories')) {
  injectScript('features/remove-zero-categories/main.js');
}

if (kango.storage.getItem('budgetRowsHeight') == 1) {
  injectCSS('features/budget-rows-height/compact.css');
}
else if (kango.storage.getItem('budgetRowsHeight') == 2) {
  injectCSS('features/budget-rows-height/slim.css');
}

if (kango.storage.getItem('categoryActivityPopupWidth') == 1) {
  injectCSS('features/category-activity-popup-width/medium.css');
}
else if (kango.storage.getItem('categoryActivityPopupWidth') == 2) {
  injectCSS('features/category-activity-popup-width/large.css');
}

if (kango.storage.getItem('moveMoneyDialog')) {
  injectCSS('features/move-money-dialog/main.css');
}

if (kango.storage.getItem('moveMoneyAutocomplete')) {
  injectCSS('features/move-money-autocomplete/main.css');
  injectScript('features/move-money-autocomplete/main.js');
}

if (kango.storage.getItem('toggleSplits')) {
  injectScript('features/toggle-splits/main.js');
}

if (kango.storage.getItem('accountsSelectedTotal')) {
  injectCSS('features/accounts-selected-total/main.css');
  injectScript('features/accounts-selected-total/main.js');
}

if (kango.storage.getItem('reconciledTextColor') != 0) {
  injectScript('features/distinguish-reconciled-transactions/main.js');
}

if (kango.storage.getItem('reconciledTextColor') == 1) {
  injectCSS('features/distinguish-reconciled-transactions/green.css');
}
else if (kango.storage.getItem('reconciledTextColor') == 2) {
  injectCSS('features/distinguish-reconciled-transactions/lightgray.css');
}
else if (kango.storage.getItem('reconciledTextColor') == 3) {
  injectCSS('features/distinguish-reconciled-transactions/darkgray.css');
}
else if (kango.storage.getItem('reconciledTextColor') == 4) {
  injectCSS('features/distinguish-reconciled-transactions/chance.css');
}
