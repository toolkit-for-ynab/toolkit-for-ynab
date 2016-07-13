'use strict';

function saveCheckboxOption(elementId) {
  var element = document.getElementById(elementId);

  if (element) {
    return setKangoSetting(elementId, element.checked);
  }

  console.log("WARNING: Tried to saveCheckboxOption but couldn't find element " + elementId + ' on the page.');
}

function saveSelectOption(elementId) {
  var select = document.getElementById(elementId);

  if (select) {
    return setKangoSetting(elementId, select.options[select.selectedIndex].value);
  }

  console.log("WARNING: Tried to saveSelectOption but couldn't find element " + elementId + ' on the page.');
}

function restoreCheckboxOption(elementId) {
  return new Promise(function (resolve) {
    var element = document.getElementById(elementId);

    if (element) {
      getKangoSetting(elementId).then(function (value) {
        element.checked = value;

        resolve();
      });
    } else {
      console.log("WARNING: Tried to restoreCheckboxOption but couldn't find element " + elementId + ' on the page.');

      // We don't actually want to error if the element isn't there, we want execution to continue.
      // It's a warning, not an error.
      resolve();
    }
  });
}

function valueIsInSelect(select, value) {
  for (var i = 0; i < select.length; i++) {
    if (select.options[i].value === value) {
      return true;
    }
  }

  return false;
}

function restoreSelectOption(elementId) {
  return new Promise(function (resolve) {
    var select = document.getElementById(elementId);

    if (select) {
      getKangoSetting(elementId).then(function (data) {
        data = data || 0;

        // Is the value in the select list?
        if (data === true && !valueIsInSelect(select, data) && valueIsInSelect(select, '1')) {
          // There is a specific upgrade path where a boolean setting
          // gets changed to a select setting, and users who had it set
          // at 'true' should now be set to '1' so the feature is still
          // enabled.
          data = '1';
        }

        // If we're down here the value should be a legitimate one, but if not
        // let's just pick the default.
        if (valueIsInSelect(select, data)) {
          select.value = data;
        } else {
          select.value = select.options[0].value;
        }

        resolve();
      });
    } else {
      console.log("WARNING: Tried to restoreSelectOption but couldn't find element " + elementId + ' on the page.');

      // We don't actually want to error if the element isn't there, we want execution to continue.
      // It's a warning, not an error.
      resolve();
    }
  });
}

function saveOptions() {
  var promises = [];

  ynabToolKit.settings.forEach(function (setting) {
    if (setting.type === 'checkbox') {
      promises.push(saveCheckboxOption(setting.name));
    } else if (setting.type === 'select') {
      promises.push(saveSelectOption(setting.name));
    }
  });

  Promise.all(promises).then(function () {
    $('#settingsSaved')
      .fadeIn()
      .delay(1500)
      .fadeOut();
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  return new Promise(function (resolve) {
    ensureDefaultsAreSet().then(function () {
      var promises = [];

      ynabToolKit.settings.forEach(function (setting) {
        if (setting.type === 'checkbox') {
          promises.push(restoreCheckboxOption(setting.name));
        } else if (setting.type === 'select') {
          promises.push(restoreSelectOption(setting.name));
        }
      });

      Promise.all(promises).then(resolve);
    });
  });
}

function buildOptionsPage() {
  // Order by section, then type, then name.
  var settings = ynabToolKit.settings.slice();

  settings.sort(function (a, b) {
    if (a.section !== b.section) {
      return a.section.localeCompare(b.section);
    }

    if (a.type !== b.type) {
      return a.type.localeCompare(b.type);
    }

    return a.title.localeCompare(b.title);
  });

  settings.forEach(function (setting) {
    if (setting.type === 'checkbox') {
      $('#' + setting.section + 'SettingsPage').append($('<div>', { class: 'row option-row' }).append($('<input>', { type: 'checkbox', id: setting.name, name: setting.name, 'aria-describedby': setting.name + 'HelpBlock' })).append($('<div>', { class: 'option-description' }).append($('<label>', { for: setting.name, text: setting.title })).append($('<span>', { id: setting.name + 'HelpBlock', class: 'help-block', text: setting.description }))));
    } else if (setting.type === 'select') {
      $('#' + setting.section + 'SettingsPage').append($('<div>', { class: 'row option-row' }).append($('<label>', { for: setting.name, text: setting.title })).append($('<select>', { name: setting.name, id: setting.name, class: 'form-control', 'aria-describedby': setting.name + 'HelpBlock' }).append(setting.options.map(function (option) {
        return $('<option>', { value: option.value, style: option.style || '', text: option.name });
      })))
      .append($('<span>', { id: setting.name + 'HelpBlock', class: 'help-block', text: setting.description })));
    }
  });
}

function loadPanel(panel, animated) {
  if (typeof animated === 'undefined') {
    animated = true;
  }

  // Do we need to do anything?
  var element = $('#' + panel + 'MenuItem');
  if (element.hasClass('active-menu')) {
    return;
  }

  $('.nav li a').removeClass('active-menu');
  element.addClass('active-menu');

  $('.settingsPage').hide();

  if (animated) {
    $('#' + panel + 'SettingsPage').fadeIn();
  } else {
    $('#' + panel + 'SettingsPage').show();
  }
}

function applyDarkMode(activate) {
  if (activate) {
    $('body').addClass('inverted');
  } else {
    $('body').removeClass('inverted');
  }
}

function importExportModal() {
  getKangoStorageKeys().then(function (keys) {
    var promises = [];
    keys.forEach(function (settingKey) {
      promises.push(new Promise(function (resolve) {
        getKangoSetting(settingKey).then(function (settingValue) {
          resolve({ key: settingKey, value: settingValue });
        });
      }));
    });

    Promise.all(promises).then(function (allSettings) {
      $('#importExportContent').val(JSON.stringify(allSettings));

      $('#importExportModal').modal();
      $('#importExportModal').one('shown.bs.modal', function () {
        $('#importExportContent').select();

        $('#importExportContent').click(function () {
          $(this).select();
        });

        $('.apply-settings').click(applySettings);
      });
    });
  });

  function applySettings() {
    var newSettings = JSON.parse($('#importExportContent').val());
    var promises = newSettings.map(function (setting) {
      return setKangoSetting(setting.key, setting.value);
    });

    Promise.all(promises).then(function () {
      location.reload();
    });
  }
}

KangoAPI.onReady(function () {
  // Set the logo.
  kango.invokeAsync('kango.io.getResourceUrl', 'assets/logos/toolkitforynab-logo-200.png', function (data) {
    $('#logo').attr('src', data);
  });

  buildOptionsPage();

  restoreOptions().then(function () {
    $('input:checkbox').bootstrapSwitch();

    loadPanel('general', false);

    $('#wrapper').fadeIn();
  });

  getKangoSetting('options.dark-mode').then(function (data) {
    applyDarkMode(data);

    $('#darkMode').bootstrapSwitch('state', data);
  });

  $('#darkMode').on('switchChange.bootstrapSwitch', function (event, state) {
    setKangoSetting('options.dark-mode', state).then(function () {
      applyDarkMode(state);
    });
  });

  $('#generalMenuItem').click(function (e) {
    loadPanel('general'); e.preventDefault();
    $('#footer-buttons').show();
  });
  $('#accountsMenuItem').click(function (e) {
    loadPanel('accounts'); e.preventDefault();
    $('#footer-buttons').show();
  });
  $('#budgetMenuItem').click(function (e) {
    loadPanel('budget'); e.preventDefault();
    $('#footer-buttons').show();
  });
  $('#supportMenuItem').click(function (e) {
    loadPanel('support'); e.preventDefault();
    $('#footer-buttons').hide();
  });

  $('.import-export-button').click(importExportModal);
  $('.save-button').click(saveOptions);
  $('.cancel-button').click(KangoAPI.closeWindow);
});
