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

function saveCheckboxOption(elementId) {
  var element = document.getElementById(elementId);

  if (element) {
    kango.storage.setItem(elementId, element.checked);
  } else {
    console.log("WARNING: Tried to saveCheckboxOption but couldn't find element " + elementId + " on the page.");
  }
}

function saveSelectOption(elementId) {
  var select = document.getElementById(elementId);

  if (select) {
    kango.storage.setItem(elementId, select.options[select.selectedIndex].value);
  } else {
    console.log("WARNING: Tried to saveSelectOption but couldn't find element " + elementId + " on the page.");
  }
}

function restoreCheckboxOption(elementId) {
  var element = document.getElementById(elementId);

  if (element) {
    element.checked = kango.storage.getItem(elementId);
  } else {
    console.log("WARNING: Tried to restoreCheckboxOption but couldn't find element " + elementId + " on the page.");
  }
}

function restoreSelectOption(elementId) {
  var data = kango.storage.getItem(elementId) || 0;
  var select = document.getElementById(elementId);

  if (select) {
    select.value = data;
  } else {
    console.log("WARNING: Tried to restoreSelectOption but couldn't find element " + elementId + " on the page.");
  }
}

function saveOptions() {

  saveCheckboxOption('collapseExpandBudgetGroups');
  saveCheckboxOption('collapseSideMenu');
  saveCheckboxOption('colourBlindMode');
  saveCheckboxOption('squareNegativeMode');
  saveCheckboxOption('hideAOM');
  saveCheckboxOption('checkCreditBalances');
  saveCheckboxOption('highlightNegativesNegative');
  saveCheckboxOption('removePositiveHighlight');
  saveCheckboxOption('enableRetroCalculator');
  saveCheckboxOption('removeZeroCategories');
  saveCheckboxOption('moveMoneyDialog');
  saveCheckboxOption('pacing');
  saveCheckboxOption('goalIndicator');
  saveCheckboxOption('moveMoneyAutocomplete');
  saveCheckboxOption('daysOfBuffering');
  saveCheckboxOption('toggleSplits');
  saveCheckboxOption('accountsSelectedTotal');
  saveCheckboxOption('changeEnterBehavior');
  saveCheckboxOption('transferJump');
  saveCheckboxOption('resizeInspector');
  saveCheckboxOption('importNotification');
  saveCheckboxOption('swapClearedFlagged');

  saveSelectOption('daysOfBufferingHistoryLookup');
  saveSelectOption('budgetRowsHeight');
  saveSelectOption('reconciledTextColor');
  saveSelectOption('categoryActivityPopupWidth');
  saveSelectOption('accountsDisplayDensity');
  saveSelectOption('editButtonPosition');
  saveSelectOption('budgetProgressBars');

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
  restoreCheckboxOption('squareNegativeMode');
  restoreCheckboxOption('hideAOM');
  restoreCheckboxOption('checkCreditBalances');
  restoreCheckboxOption('highlightNegativesNegative');
  restoreCheckboxOption('removePositiveHighlight');
  restoreCheckboxOption('enableRetroCalculator');
  restoreCheckboxOption('removeZeroCategories');
  restoreCheckboxOption('moveMoneyDialog');
  restoreCheckboxOption('pacing');
  restoreCheckboxOption('goalIndicator');
  restoreCheckboxOption('moveMoneyAutocomplete');
  restoreCheckboxOption('daysOfBuffering');
  restoreCheckboxOption('toggleSplits');
  restoreCheckboxOption('accountsSelectedTotal');
  restoreCheckboxOption('changeEnterBehavior');
  restoreCheckboxOption('transferJump');
  restoreCheckboxOption('resizeInspector');
  restoreCheckboxOption('importNotification');
  restoreCheckboxOption('swapClearedFlagged');

  restoreSelectOption('daysOfBufferingHistoryLookup');
  restoreSelectOption('budgetRowsHeight');
  restoreSelectOption('reconciledTextColor');
  restoreSelectOption('categoryActivityPopupWidth');
  restoreSelectOption('accountsDisplayDensity');
  restoreSelectOption('editButtonPosition');
  restoreSelectOption('budgetProgressBars');
}

function loadPanel(panel, animated) {
  if (typeof animated === 'undefined') {
    animated = true;
  }

  // Do we need to do anything?
  var element = $('#' + panel + 'MenuItem');
  if (element.hasClass('active-menu')) { return; }

  $('.nav li a').removeClass('active-menu');
  element.addClass('active-menu');

  $('.settingsPage').hide();

  if (animated) {
    $('#' + panel + "SettingsPage").fadeIn();
  } else {
    $('#' + panel + "SettingsPage").show();
  }
}

KangoAPI.onReady(function() {
  setTimeout(function() {
    restoreOptions();

    $('input:checkbox').bootstrapSwitch();

    loadPanel('general', false);

    $('#generalMenuItem').click(function(e) { loadPanel('general'); e.preventDefault(); });
    $('#accountsMenuItem').click(function(e) { loadPanel('accounts'); e.preventDefault(); });
    $('#budgetMenuItem').click(function(e) { loadPanel('budget'); e.preventDefault(); });

    $('.save-button').click(saveOptions);
    $('.cancel-button').click(function() {
      KangoAPI.closeWindow();
    });
  }, 50); // A small setTimeout allows KangoAPI to work without needing to be async
          // which looks like it'd be hugely painful to implement. The docs say
          // we should be doing async here, and if it stops working, revisit this decision.

  $('#logo').attr('src', kango.io.getResourceUrl('assets/logos/toolkitforynab-logo-200.png'));
});
