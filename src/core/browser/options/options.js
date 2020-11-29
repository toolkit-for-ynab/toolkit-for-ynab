import { getBrowser } from 'toolkit/core/common/web-extensions';
import { allToolkitSettings, getUserSettings } from 'toolkit/core/settings';
import { ToolkitStorage } from 'toolkit/core/common/storage';

// Other extensions (e.g. ebates) can load other versions of jQuery. We need to use ours in noconflict mode
// or we lose bootstrapSwitch() which then breaks the options page.
// For more info, see here: https://github.com/toolkit-for-ynab/toolkit-for-ynab/issues/287
const jq = jQuery.noConflict(true);
const storage = new ToolkitStorage();

jq(() => {
  /* eslint-disable no-undef */
  marked.setOptions({
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: true, // prevent xss attacks by not allowing html in the markdown
    smartLists: true,
    smartypants: false,
  });

  function saveCheckboxOption(elementId) {
    var element = document.getElementById(elementId);

    if (element) {
      return storage.setFeatureSetting(elementId, element.checked);
    }

    console.log(
      "WARNING: Tried to saveCheckboxOption but couldn't find element " +
        elementId +
        ' on the page.'
    );
  }

  function saveColorOption(elementId) {
    var element = document.getElementById(elementId);

    if (element) {
      const value = jq(element).colorpicker('getValue');
      return storage.setFeatureSetting(elementId, value);
    }

    console.log(
      "WARNING: Tried to saveColorOption but couldn't find element " + elementId + ' on the page.'
    );
  }

  function saveSelectOption(elementId) {
    var select = document.getElementById(elementId);

    if (select) {
      return storage.setFeatureSetting(elementId, select.options[select.selectedIndex].value);
    }

    console.log(
      "WARNING: Tried to saveSelectOption but couldn't find element " + elementId + ' on the page.'
    );
  }

  function restoreCheckboxOption(elementId, currentSetting) {
    const element = document.getElementById(elementId);

    if (element) {
      element.checked = currentSetting;
    } else {
      console.log(
        "WARNING: Tried to restoreCheckboxOption but couldn't find element " +
          elementId +
          ' on the page.'
      );
    }
  }

  function restoreColorOption(elementId, currentSetting) {
    const element = document.getElementById(elementId);

    if (element) {
      jq(element).colorpicker('setValue', currentSetting);
    } else {
      console.log(
        "WARNING: Tried to restoreColorOption but couldn't find element " +
          elementId +
          ' on the page.'
      );
    }
  }

  function valueIsInSelect(select, value) {
    for (var i = 0; i < select.length; i++) {
      if (select.options[i].value === value) {
        return true;
      }
    }

    return false;
  }

  function restoreSelectOption(elementId, currentSetting) {
    const select = document.getElementById(elementId);

    if (select) {
      let data = currentSetting || '0';

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
    } else {
      console.log(
        "WARNING: Tried to restoreSelectOption but couldn't find element " +
          elementId +
          ' on the page.'
      );
    }
  }

  function saveOptions() {
    var promises = [];

    allToolkitSettings.forEach(setting => {
      if (setting.type === 'checkbox') {
        promises.push(saveCheckboxOption(setting.name));
      } else if (setting.type === 'color') {
        promises.push(saveColorOption(setting.name));
      } else if (setting.type === 'select') {
        promises.push(saveSelectOption(setting.name));
      }
    });

    Promise.all(promises).then(() => {
      jq('#settingsSaved')
        .fadeIn()
        .delay(1500)
        .fadeOut();
    });
  }

  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restoreOptions(userSettings) {
    allToolkitSettings.forEach(setting => {
      if (setting.type === 'checkbox') {
        restoreCheckboxOption(setting.name, userSettings[setting.name]);
      } else if (setting.type === 'color') {
        restoreColorOption(setting.name, userSettings[setting.name]);
      } else if (setting.type === 'select') {
        restoreSelectOption(setting.name, userSettings[setting.name]);
      }
    });

    loadPanel('general');
    jq('#wrapper').fadeIn();
    jq('input:checkbox').bootstrapSwitch();
  }

  function initializeSettingPages() {
    const templateSelector = '#genericSettingsPage';
    const selectors = {
      pageContent: templateSelector,
      icon: templateSelector + ' .fa',
      title: templateSelector + ' .page-header-title',
      actions: templateSelector + ' .actions',
    };
    const pages = [
      {
        id: 'generalSettingsPage',
        iconClass: 'fa-cogs',
        title: 'General Settings',
        showActions: true,
      },
      {
        id: 'accountsSettingsPage',
        iconClass: 'fa-university',
        title: 'Accounts Screen Settings',
        showActions: true,
      },
      {
        id: 'budgetSettingsPage',
        iconClass: 'fa-envelope-o',
        title: 'Budget Screen Settings',
        showActions: true,
      },
      {
        id: 'toolkitReportsSettingsPage',
        iconClass: 'fa-file-text-o',
        title: 'Toolkit Reports Screen Settings',
        showActions: true,
      },
      {
        id: 'reportsSettingsPage',
        iconClass: 'fa-bar-chart',
        title: 'Reports Screen Settings',
        showActions: true,
      },
    ];

    pages.forEach(page => {
      const genericSettingsPage = document.querySelector(selectors.pageContent).cloneNode(true);

      genericSettingsPage.querySelector(selectors.icon).classList.add(page.iconClass);
      genericSettingsPage.querySelector(selectors.title).textContent = page.title;

      const classList = genericSettingsPage.querySelector(selectors.actions).classList;
      if (page.showActions) {
        classList.remove('hidden');
      } else {
        classList.add('hidden');
      }

      document.querySelector('#' + page.id).innerHTML = genericSettingsPage.innerHTML;
    });
  }

  function buildOptionsPage() {
    initializeSettingPages();

    // Order by section, then type, then name.
    var settings = allToolkitSettings.slice().filter(setting => setting.section !== 'system');

    settings.sort(function(a, b) {
      if (a.section !== b.section) {
        return a.section.localeCompare(b.section);
      }

      if (a.type !== b.type) {
        return a.type.localeCompare(b.type);
      }

      return a.title.localeCompare(b.title);
    });

    settings.forEach(function(setting) {
      if (setting.section === 'system') return;

      let markDown = marked(setting.description);

      if (setting.type === 'checkbox') {
        jq('#' + setting.section + 'SettingsPage > .content').append(
          jq('<div>', { class: 'row option-row' })
            .append(
              jq('<input>', {
                type: 'checkbox',
                id: setting.name,
                name: setting.name,
                'aria-describedby': setting.name + 'HelpBlock',
              })
            )
            .append(
              jq('<div>', { class: 'option-description' })
                .append(jq('<label>', { for: setting.name, text: setting.title }))
                .append(
                  jq('<span>', {
                    id: setting.name + 'HelpBlock',
                    class: 'help-block',
                  })
                )
            )
        );
        jq('#' + setting.name + 'HelpBlock').html(markDown);
      } else if (setting.type === 'select') {
        jq('#' + setting.section + 'SettingsPage > .content').append(
          jq('<div>', { class: 'row option-row' })
            .append(jq('<label>', { for: setting.name, text: setting.title }))
            .append(
              jq('<select>', {
                name: setting.name,
                id: setting.name,
                class: 'form-control',
                'aria-describedby': setting.name + 'HelpBlock',
              }).append(
                setting.options.map(function(option) {
                  return jq('<option>', {
                    value: option.value,
                    style: option.style || '',
                    text: option.name,
                  });
                })
              )
            )
            .append(
              jq('<span>', {
                id: setting.name + 'HelpBlock',
                class: 'help-block',
              })
            )
        );
        jq('#' + setting.name + 'HelpBlock').html(markDown);
      } else if (setting.type === 'color') {
        jq('#' + setting.section + 'SettingsPage > .content').append(
          jq('<div>', { class: 'row option-row' })
            .append(jq('<label>', { for: setting.name + 'Input', text: setting.title }))
            .append(
              jq('<div>', {
                id: setting.name,
                class: 'input-group colorpicker-element',
              })
                .append(
                  jq('<input>', {
                    type: 'text',
                    id: setting.name + 'Input',
                    class: 'form-control',
                    name: setting.name,
                    'aria-describedby': setting.name + 'HelpBlock',
                  })
                )
                .append(jq('<span>', { class: 'input-group-addon' }).append(jq('<i>')))
                .colorpicker({ color: setting.default })
            )
            .append(
              jq('<span>', {
                id: setting.name + 'HelpBlock',
                class: 'help-block',
              })
            )
        );
        jq('#' + setting.name + 'HelpBlock').html(markDown);
      }
    });
  }

  function loadPanel(panel, animated) {
    if (typeof animated === 'undefined') {
      animated = true;
    }

    // Do we need to do anything?
    var element = jq('#' + panel + 'MenuItem');
    if (element.hasClass('active-menu')) {
      return;
    }

    jq('.nav li a').removeClass('active-menu');
    element.addClass('active-menu');

    jq('.settingsPage').hide();

    if (animated) {
      jq('#' + panel + 'SettingsPage').fadeIn();
    } else {
      jq('#' + panel + 'SettingsPage').show();
    }
  }

  function applyDarkMode(activate) {
    if (activate) {
      jq('body').addClass('inverted');
    } else {
      jq('body').removeClass('inverted');
    }
  }

  function importExportModal() {
    storage.getStoredFeatureSettings().then(function(keys) {
      const promises = keys.map(settingKey => {
        return storage.getFeatureSetting(settingKey).then(settingValue => {
          return { key: settingKey, value: settingValue };
        });
      });

      Promise.all(promises).then(allSettings => {
        jq('#importExportContent').val(JSON.stringify(allSettings));

        jq('#importExportModal').modal();
        jq('#importExportModal').one('shown.bs.modal', function() {
          jq('#importExportContent').select();

          jq('#importExportContent').click(function() {
            jq(this).select();
          });

          jq('.apply-settings').click(applySettings);
        });
      });
    });

    function applySettings() {
      const newSettings = JSON.parse(jq('#importExportContent').val());
      const promises = newSettings.map(function(setting) {
        return storage.setFeatureSetting(setting.key, setting.value);
      });

      Promise.all(promises).then(function() {
        window.location.reload();
      });
    }
  }

  function openModal(title, content, fn) {
    console.log('openModal: ', arguments);
    console.log('openModal: fn', fn);

    const modalSelector = '#confirmationModal';

    jq(`${modalSelector} .modal-title`).text(title);
    jq(`${modalSelector} .modal-body`).html(content);

    jq(modalSelector).modal();
    jq(modalSelector).one('shown.bs.modal', function() {
      jq(`${modalSelector} .confirmationButton`).click(fn);
    });
  }

  function resetSettings() {
    // ensure there aren't any pre-web-extensions feature settings stored
    localStorage.clear();

    return storage.getStoredFeatureSettings().then(settings => {
      localStorage.clear();
      const promises = settings.map(settingKey => {
        return storage.removeFeatureSetting(settingKey);
      });

      Promise.all(promises).then(() => {
        window.location.reload();
      });
    });
  }

  function watchScrollForPageHeader() {
    const pageHeaderSelector = '.page-header';
    const successSelector = '#settingsSaved';

    const topHeaderHeight = jq('nav.top-navbar').height();
    const preferredClass = 'sticky-header';

    jq(window).scroll(function() {
      if (jq(window).scrollTop() >= topHeaderHeight) {
        jq(pageHeaderSelector).addClass(preferredClass);
        jq(successSelector).addClass(preferredClass);
      } else {
        jq(pageHeaderSelector).removeClass(preferredClass);
        jq(successSelector).removeClass(preferredClass);
      }
    });
  }

  function updateToolkitLogo(isToolkitDisabled) {
    const logo = `assets/images/logos/toolkitforynab-logo-200${
      isToolkitDisabled ? '-disabled' : ''
    }.png`;
    jq('#logo').attr('src', getBrowser().runtime.getURL(logo));
  }

  function toggleToolkit() {
    storage.getFeatureSetting('DisableToolkit').then(isDisabled => {
      storage.setFeatureSetting('DisableToolkit', !isDisabled);
    });
  }

  storage.onFeatureSettingChanged('DisableToolkit', updateToolkitLogo);
  jq('#logo').click(toggleToolkit);

  getUserSettings().then(userSettings => {
    updateToolkitLogo(userSettings.DisableToolkit);

    buildOptionsPage();
    watchScrollForPageHeader();

    restoreOptions(userSettings);

    storage.getFeatureSetting('options.dark-mode').then(function(data) {
      applyDarkMode(data);

      jq('#darkMode').bootstrapSwitch('state', data);
    });

    jq('#darkMode').on('switchChange.bootstrapSwitch', function(event, state) {
      storage.setFeatureSetting('options.dark-mode', state).then(function() {
        applyDarkMode(state);
      });
    });

    jq('#generalMenuItem').click(function(e) {
      loadPanel('general');
      e.preventDefault();
    });
    jq('#accountsMenuItem').click(function(e) {
      loadPanel('accounts');
      e.preventDefault();
    });
    jq('#budgetMenuItem').click(function(e) {
      loadPanel('budget');
      e.preventDefault();
    });
    jq('#reportsMenuItem').click(function(e) {
      loadPanel('reports');
      e.preventDefault();
    });
    jq('#toolkitReportsMenuItem').click(function(e) {
      loadPanel('toolkitReports');
      e.preventDefault();
    });
    jq('#supportMenuItem').click(function(e) {
      loadPanel('support', false);
      e.preventDefault();
    });
    jq('#advancedMenuItem').click(function(e) {
      loadPanel('advanced');
      e.preventDefault();
      jq('#footer-buttons').hide();
    });

    jq('.import-export-button').click(importExportModal);
    jq('.save-button').click(saveOptions);
    jq('.cancel-button').click(() => window.close());

    jq('.reset-settings-button').click(() => {
      return openModal(
        'Reset Settings',
        document.querySelector('#resetSettingsModalContent').innerHTML,
        resetSettings
      );
    });

    // set version number
    jq('.toolkit-version').text('v ' + getBrowser().runtime.getManifest().version);
  });
});
