// Useful for debugging the settings page outside of chrome settings!
// var chrome = {
//   storage: { sync: {
//     set: function (defaults, callback) { callback(defaults); },
//     get: function (defaults, callback) { callback(defaults); }
//   }}
// };

function save_options() {
  var collapseExpandBudgetGroups = document.getElementById('collapseExpandBudgetGroups').checked;
  var colourBlindMode = document.getElementById('colourBlindMode').checked;
  var hideAOM = document.getElementById('hideAOM').checked;
  var checkCreditBalances = document.getElementById('checkCreditBalances').checked;
  var highlightNegativesNegative = document.getElementById('highlightNegativesNegative').checked;
  var enableRetroCalculator = document.getElementById('enableRetroCalculator').checked;
  var removeZeroCategories = document.getElementById('removeZeroCategories').checked;
  var budgetRowsHeightSelect = document.getElementById('budgetRowsHeight');
  budgetRowsHeight = budgetRowsHeightSelect.options[budgetRowsHeightSelect.selectedIndex].value;
  var reconciledTextColorSelect = document.getElementById('reconciledTextColor');
  reconciledTextColor = reconciledTextColorSelect.options[reconciledTextColorSelect.selectedIndex].value;
  var categoryActivityPopupWidthSelect = document.getElementById('categoryActivityPopupWidth');
  categoryActivityPopupWidth = categoryActivityPopupWidthSelect.options[categoryActivityPopupWidthSelect.selectedIndex].value;
  var moveMoneyDialog = document.getElementById('moveMoneyDialog').checked;
  var moveMoneyAutocomplete = document.getElementById('moveMoneyAutocomplete').checked;
  var toggleSplits = document.getElementById('toggleSplits').checked;
  var accountsSelectedTotal = document.getElementById('accountsSelectedTotal').checked;

  chrome.storage.sync.set({
    collapseExpandBudgetGroups: collapseExpandBudgetGroups,
    colourBlindMode: colourBlindMode,
    hideAOM: hideAOM,
    checkCreditBalances: checkCreditBalances,
    highlightNegativesNegative: highlightNegativesNegative,
    enableRetroCalculator: enableRetroCalculator,
    removeZeroCategories: removeZeroCategories,
    budgetRowsHeight: budgetRowsHeight,
    reconciledTextColor: reconciledTextColor,
    categoryActivityPopupWidth: categoryActivityPopupWidth,
    moveMoneyDialog: moveMoneyDialog,
    moveMoneyAutocomplete: moveMoneyAutocomplete,
    toggleSplits: toggleSplits,
    accountsSelectedTotal: accountsSelectedTotal
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';

    setTimeout(function() {
      status.textContent = '';
    }, 1000);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {

  chrome.storage.sync.get({
    collapseExpandBudgetGroups: true,
    colourBlindMode: false,
    hideAOM: false,
    checkCreditBalances: false,
    highlightNegativesNegative: false,
    enableRetroCalculator: true,
    removeZeroCategories: true,
    moveMoneyDialog: false,
    budgetRowsHeight: 0,
    categoryActivityPopupWidth: 0,
    budgetRowsHeight: 0,
    moveMoneyAutocomplete: false,
    toggleSplits: false,
    accountsSelectedTotal: false
    reconciledTextColor: 0
  }, function(items) {
    document.getElementById('collapseExpandBudgetGroups').checked = items.collapseExpandBudgetGroups;
    document.getElementById('colourBlindMode').checked = items.colourBlindMode;
    document.getElementById('hideAOM').checked = items.hideAOM;
    document.getElementById('checkCreditBalances').checked = items.checkCreditBalances;
    document.getElementById('highlightNegativesNegative').checked = items.highlightNegativesNegative;
    document.getElementById('enableRetroCalculator').checked = items.enableRetroCalculator;
    document.getElementById('removeZeroCategories').checked = items.removeZeroCategories;
    var budgetRowsHeightSelect = document.getElementById('budgetRowsHeight');
    budgetRowsHeightSelect.value = items.budgetRowsHeight;
    var reconciledTextColorSelect = document.getElementById('reconciledTextColor');
    reconciledTextColorSelect.value = items.reconciledTextColor;
    var categoryActivityPopupWidthSelect = document.getElementById('categoryActivityPopupWidth');
    categoryActivityPopupWidthSelect.value = items.categoryActivityPopupWidth;
    document.getElementById('moveMoneyDialog').checked = items.moveMoneyDialog;
    document.getElementById('moveMoneyAutocomplete').checked = items.moveMoneyAutocomplete;
    document.getElementById('toggleSplits').checked = items.toggleSplits;
    document.getElementById('accountsSelectedTotal').checked = items.accountsSelectedTotal;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
