function getKangoSetting(settingName) {

  return new Promise(function(resolve, reject) {
    kango.invokeAsync('kango.storage.getItem', settingName, function(data) {
      resolve(data);
    });
  });
}

function setKangoSetting(settingName, data) {
  return new Promise(function(resolve, reject) {
    kango.invokeAsync('kango.storage.setItem', settingName, data, function(data) {
      resolve("success");
    });
  });
}

function getKangoStorageKeys() {
  return new Promise(function(resolve, reject) {
    kango.invokeAsync('kango.storage.getKeys', function(keys) {
      resolve(keys);
    });
  });
}

function ensureDefaultsAreSet() {
  return new Promise(function(resolve, reject) {
    getKangoStorageKeys().then(function(storedKeys) {

      var promises = [];

      if (storedKeys.indexOf('collapseExpandBudgetGroups') < 0) {
        promises.push(setKangoSetting('collapseExpandBudgetGroups', true));
      }

      if (storedKeys.indexOf('enableRetroCalculator') < 0) {
        promises.push(setKangoSetting('enableRetroCalculator', true));
      }

      if (storedKeys.indexOf('removeZeroCategories') < 0) {
        promises.push(setKangoSetting('removeZeroCategories', true));
      }

      Promise.all(promises).then(function() {
        resolve();
      });
    });
  });
}

function saveCheckboxOption(elementId) {
  var element = document.getElementById(elementId);

  if (element) {
    return setKangoSetting(elementId, element.checked);
  } else {
    console.log("WARNING: Tried to saveCheckboxOption but couldn't find element " + elementId + " on the page.");
  }
}

function saveSelectOption(elementId) {
  var select = document.getElementById(elementId);

  if (select) {
    return setKangoSetting(elementId, select.options[select.selectedIndex].value);
  } else {
    console.log("WARNING: Tried to saveSelectOption but couldn't find element " + elementId + " on the page.");
  }
}

function restoreCheckboxOption(elementId) {
  return new Promise(function(resolve, reject) {
    var element = document.getElementById(elementId);

    if (element) {
      getKangoSetting(elementId).then(function(value) {
        element.checked = value;

        resolve();
      });

    } else {
      console.log("WARNING: Tried to restoreCheckboxOption but couldn't find element " + elementId + " on the page.");

      // We don't actually want to error if the element isn't there, we want execution to continue.
      // It's a warning, not an error.
      resolve();
    }
  });
}

function restoreSelectOption(elementId) {
  return new Promise(function(resolve, reject) {
    var select = document.getElementById(elementId);

    if (select) {
      getKangoSetting(elementId).then(function(data) {
        data = data || 0;

        select.value = data;

        resolve();
      });
    } else {
      console.log("WARNING: Tried to restoreSelectOption but couldn't find element " + elementId + " on the page.");

      // We don't actually want to error if the element isn't there, we want execution to continue.
      // It's a warning, not an error.
      resolve();
    }
  });

}

function saveOptions() {

  Promise.all([
    saveCheckboxOption('collapseExpandBudgetGroups'),
    saveCheckboxOption('collapseSideMenu'),
    saveCheckboxOption('colourBlindMode'),
    saveCheckboxOption('squareNegativeMode'),
    saveCheckboxOption('hideAOM'),
    saveCheckboxOption('checkCreditBalances'),
    saveCheckboxOption('highlightNegativesNegative'),
    saveCheckboxOption('removePositiveHighlight'),
    saveCheckboxOption('enableRetroCalculator'),
    saveCheckboxOption('removeZeroCategories'),
    saveCheckboxOption('moveMoneyDialog'),
    saveCheckboxOption('pacing'),
    saveCheckboxOption('goalIndicator'),
    saveCheckboxOption('moveMoneyAutocomplete'),
    saveCheckboxOption('daysOfBuffering'),
    saveCheckboxOption('toggleSplits'),
    saveCheckboxOption('accountsSelectedTotal'),
    saveCheckboxOption('changeEnterBehavior'),
    saveCheckboxOption('transferJump'),
    saveCheckboxOption('resizeInspector'),
    saveCheckboxOption('importNotification'),
    saveCheckboxOption('swapClearedFlagged'),
    saveCheckboxOption('warnOnQuickBudget'),

    saveSelectOption('daysOfBufferingHistoryLookup'),
    saveSelectOption('budgetRowsHeight'),
    saveSelectOption('reconciledTextColor'),
    saveSelectOption('categoryActivityPopupWidth'),
    saveSelectOption('accountsDisplayDensity'),
    saveSelectOption('editButtonPosition'),
    saveSelectOption('budgetProgressBars')
  ]).then(function() {

    $('#settingsSaved').fadeIn()
                       .delay(1500)
                       .fadeOut();

  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {

  return new Promise(function (resolve, reject) {
    ensureDefaultsAreSet().then(function() {

      Promise.all([
        restoreCheckboxOption('collapseExpandBudgetGroups'),
        restoreCheckboxOption('collapseSideMenu'),
        restoreCheckboxOption('colourBlindMode'),
        restoreCheckboxOption('squareNegativeMode'),
        restoreCheckboxOption('hideAOM'),
        restoreCheckboxOption('checkCreditBalances'),
        restoreCheckboxOption('highlightNegativesNegative'),
        restoreCheckboxOption('removePositiveHighlight'),
        restoreCheckboxOption('enableRetroCalculator'),
        restoreCheckboxOption('removeZeroCategories'),
        restoreCheckboxOption('moveMoneyDialog'),
        restoreCheckboxOption('pacing'),
        restoreCheckboxOption('goalIndicator'),
        restoreCheckboxOption('moveMoneyAutocomplete'),
        restoreCheckboxOption('daysOfBuffering'),
        restoreCheckboxOption('toggleSplits'),
        restoreCheckboxOption('accountsSelectedTotal'),
        restoreCheckboxOption('changeEnterBehavior'),
        restoreCheckboxOption('transferJump'),
        restoreCheckboxOption('resizeInspector'),
        restoreCheckboxOption('importNotification'),
        restoreCheckboxOption('swapClearedFlagged'),
        restoreCheckboxOption('warnOnQuickBudget'),

        restoreSelectOption('daysOfBufferingHistoryLookup'),
        restoreSelectOption('budgetRowsHeight'),
        restoreSelectOption('reconciledTextColor'),
        restoreSelectOption('categoryActivityPopupWidth'),
        restoreSelectOption('accountsDisplayDensity'),
        restoreSelectOption('editButtonPosition'),
        restoreSelectOption('budgetProgressBars')
      ]).then(function() {
        resolve();
      }, function() {
        console.log("Ensure defaults are set failed.");
      });
    });
  });
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
  // Set the logo.
  kango.invokeAsync('kango.io.getResourceUrl', 'assets/logos/toolkitforynab-logo-200.png', function(data) {
    $('#logo').attr('src', data);
  });

  restoreOptions().then(function() {
    $('input:checkbox').bootstrapSwitch();

    loadPanel('general', false);

    $('#wrapper').fadeIn();
  });

  $('#generalMenuItem').click(function(e) { loadPanel('general'); e.preventDefault(); });
  $('#accountsMenuItem').click(function(e) { loadPanel('accounts'); e.preventDefault(); });
  $('#budgetMenuItem').click(function(e) { loadPanel('budget'); e.preventDefault(); });

  $('.save-button').click(saveOptions);
  $('.cancel-button').click(KangoAPI.closeWindow);
});
