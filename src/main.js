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

/* Features that are on permanently without configuration options */


chrome.storage.sync.get({
  collapseExpandBudgetGroups: true,
  collapseSideMenu: false,
  colourBlindMode: false,
  hideAOM: false,
  checkCreditBalances: false,
  highlightNegativesNegative: false,
  enableRetroCalculator: true,
  removeZeroCategories: true,
  budgetRowsHeight: 0,
  reconciledTextColor: 0,
  categoryActivityPopupWidth: 0,
  budgetRowsHeight: 0,
  moveMoneyDialog: false,
  moveMoneyAutocomplete: true,
  toggleSplits: false,
  accountsSelectedTotal: false,
  accountsDisplayDensity: 0,
}, function(options) {

  if (options.collapseExpandBudgetGroups) {
    injectCSS('features/collapse-budget-groups/main.css');
    injectScript('features/collapse-budget-groups/main.js');
  }

  if (options.collapseSideMenu) {
    injectCSS('features/collapse-side-menu/main.css');
    injectScript('features/collapse-side-menu/main.js');
  }

  if (options.colourBlindMode) {
    injectCSS('features/colour-blind-mode/main.css');
  }

  if (options.hideAOM) {
    injectCSS('features/hide-age-of-money/main.css');
  }

  if (options.highlightNegativesNegative) {
    injectScript('features/highlight-negatives-negative/main.js');
  }

  if (options.checkCreditBalances) {
    injectScript('features/check-credit-balances/main.js');
  }

  if (options.enableRetroCalculator) {
    injectScript('features/ynab-4-calculator/main.js');
  }

  if (options.removeZeroCategories) {
    injectScript('features/remove-zero-categories/main.js');
  }

  if (options.budgetRowsHeight == 1) {
    injectCSS('features/budget-rows-height/compact.css');
  }
  else if (options.budgetRowsHeight == 2) {
    injectCSS('features/budget-rows-height/slim.css');
  }

  if (options.categoryActivityPopupWidth == 1) {
    injectCSS('features/category-activity-popup-width/medium.css');
  }
  else if (options.categoryActivityPopupWidth == 2) {
    injectCSS('features/category-activity-popup-width/large.css');
  }

  if (options.moveMoneyDialog) {
    injectCSS('features/move-money-dialog/main.css');
  }

  if (options.moveMoneyAutocomplete) {
    injectCSS('features/move-money-autocomplete/main.css');
    injectScript('features/move-money-autocomplete/main.js');
  }

  if (options.toggleSplits) {
    injectScript('features/toggle-splits/main.js');
  }

  if (options.accountsSelectedTotal) {
    injectCSS('features/accounts-selected-total/main.css');
    injectScript('features/accounts-selected-total/main.js');
  }

  if (options.reconciledTextColor != 0) {
    injectScript('features/distinguish-reconciled-transactions/main.js');
  }

  if (options.reconciledTextColor == 1) {
    injectCSS('features/distinguish-reconciled-transactions/green.css');
  }
  else if (options.reconciledTextColor == 2) {
    injectCSS('features/distinguish-reconciled-transactions/lightgray.css');
  }
  else if (options.reconciledTextColor == 3) {
    injectCSS('features/distinguish-reconciled-transactions/darkgray.css');
  }
  else if (options.reconciledTextColor == 4) {
    injectCSS('features/distinguish-reconciled-transactions/chance.css');
  }
  
  if (options.accountsDisplayDensity == 1) {
    injectCSS('features/accounts-display-density/compact.css');
  }
  else if (options.accountsDisplayDensity == 2) {
    injectCSS('features/accounts-display-density/slim.css');
  }
});
