// Useful for debugging the settings page outside of chrome settings!
// var chrome = {
//   storage: { sync: {
//     set: function (defaults, callback) { callback(defaults); },
//     get: function (defaults, callback) { callback(defaults); }
//   }}
// };

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
  
  if (storedKeys.indexOf('transferJump') < 0) {
    kango.storage.setItem('transferJump', true);
  }
}

function saveCheckboxOption(elementId) {
  var checked = document.getElementById(elementId).checked;
  kango.storage.setItem(elementId, checked);
}

function saveSelectOption(elementId) {
  var select = document.getElementById(elementId);
  kango.storage.setItem(elementId, select.options[select.selectedIndex].value);
}

function restoreCheckboxOption(elementId) {
  var checked = kango.storage.getItem(elementId);
  document.getElementById(elementId).checked = checked;
}

function restoreSelectOption(elementId) {
  var data = kango.storage.getItem(elementId) || 0;
  var select = document.getElementById(elementId);

  select.value = data;
}

function save_options() {

  saveCheckboxOption('collapseExpandBudgetGroups');
  saveCheckboxOption('collapseSideMenu');
  saveCheckboxOption('colourBlindMode');
  saveCheckboxOption('hideAOM');
  saveCheckboxOption('checkCreditBalances');
  saveCheckboxOption('highlightNegativesNegative');
  saveCheckboxOption('enableRetroCalculator');
  saveCheckboxOption('removeZeroCategories');
  saveCheckboxOption('moveMoneyDialog');
  saveCheckboxOption('moveMoneyAutocomplete');
  saveCheckboxOption('toggleSplits');
  saveCheckboxOption('accountsSelectedTotal');
  saveCheckboxOption('changeEnterBehavior');
  saveCheckboxOption('transferJump');

  saveSelectOption('budgetRowsHeight');
  saveSelectOption('reconciledTextColor');
  saveSelectOption('categoryActivityPopupWidth');
  saveSelectOption('accountsDisplayDensity');
  saveSelectOption('editButtonPosition');

  // Update status to let user know options were saved.
  var status = document.getElementById('status');
  status.textContent = 'Options saved.';

  setTimeout(function() {
    status.textContent = '';
  }, 1000);
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {

  ensureDefaultsAreSet();

  restoreCheckboxOption('collapseExpandBudgetGroups');
  restoreCheckboxOption('collapseSideMenu');
  restoreCheckboxOption('colourBlindMode');
  restoreCheckboxOption('hideAOM');
  restoreCheckboxOption('checkCreditBalances');
  restoreCheckboxOption('highlightNegativesNegative');
  restoreCheckboxOption('enableRetroCalculator');
  restoreCheckboxOption('removeZeroCategories');
  restoreCheckboxOption('moveMoneyDialog');
  restoreCheckboxOption('moveMoneyAutocomplete');
  restoreCheckboxOption('toggleSplits');
  restoreCheckboxOption('accountsSelectedTotal');
  restoreCheckboxOption('changeEnterBehavior');
  restoreCheckboxOption('transferJump');

  restoreSelectOption('budgetRowsHeight');
  restoreSelectOption('reconciledTextColor');
  restoreSelectOption('categoryActivityPopupWidth');
  restoreSelectOption('accountsDisplayDensity');
  restoreSelectOption('editButtonPosition');
}

KangoAPI.onReady(function() {
  restore_options();
});

document.getElementById('save').addEventListener('click', save_options);
