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

function saveOptions() {

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
  saveCheckboxOption('daysOfBuffering');
  saveCheckboxOption('toggleSplits');
  saveCheckboxOption('accountsSelectedTotal');
  saveCheckboxOption('changeEnterBehavior');
  saveCheckboxOption('transferJump');

  saveSelectOption('budgetRowsHeight');
  saveSelectOption('reconciledTextColor');
  saveSelectOption('categoryActivityPopupWidth');
  saveSelectOption('accountsDisplayDensity');
  saveSelectOption('editButtonPosition');

  $('#settingsSaved').fadeIn()
                     .delay(1500)
                     .fadeOut();
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {

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
  restoreCheckboxOption('daysOfBuffering');
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

function loadPanel(panel) {

  // Do we need to do anything?
  var element = $('#' + panel + 'MenuItem');
  if (element.hasClass('active-menu')) { return; }

  $('.nav li a').removeClass('active-menu');
  element.addClass('active-menu');

  $('.settingsPage').hide();
  $('#' + panel + "SettingsPage").fadeIn();
}

KangoAPI.onReady(function() {
  restoreOptions();

  $('input:checkbox').bootstrapSwitch();

  loadPanel('general');

  $('#generalMenuItem').click(function(e) { loadPanel('general'); e.preventDefault(); });
  $('#accountsMenuItem').click(function(e) { loadPanel('accounts'); e.preventDefault(); });
  $('#budgetMenuItem').click(function(e) { loadPanel('budget'); e.preventDefault(); });

  $('#save').click(saveOptions);
  $('#cancel').click(function() {
    KangoAPI.closeWindow();
  });

});
