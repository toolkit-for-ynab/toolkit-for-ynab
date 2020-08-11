import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

const Settings = {
  AlwaysOn: '1',
  Toggle: '2',
};

export class PrivacyMode extends Feature {
  injectCSS() {
    let css = require('./index.css');

    if (this.settings.enabled === Settings.Toggle) {
      css += require('./toggle.css');
    }

    return css;
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    const self = this;
    let toggle = getToolkitStorageKey('privacy-mode');
    if (typeof toggle === 'undefined') {
      setToolkitStorageKey('privacy-mode', false);
    }

    if (ynabToolKit.options.PrivacyMode === Settings.Toggle) {
      if (!$('#tk-toggle-privacy').length) {
        $('.sidebar-bottom').prepend(
          $('<button>', {
            id: 'tk-toggle-privacy',
            class: 'tk-toggle-privacy',
          })
            .append(
              $('<i>', {
                class: 'tk-toggle-privacy__icon flaticon stroke lock-1',
              })
            )
            .click(() => {
              self.togglePrivacyMode();
            })
        );
      }
    } else if (ynabToolKit.options.PrivacyMode === Settings.AlwaysOn) {
      setToolkitStorageKey('privacy-mode', true);
    }

    this.updatePrivacyMode();
  }

  togglePrivacyMode() {
    $('#tk-toggle-privacy').toggleClass('active');

    let toggle = getToolkitStorageKey('privacy-mode');
    setToolkitStorageKey('privacy-mode', !toggle);
    this.updatePrivacyMode();
  }

  updatePrivacyMode() {
    let toggle = getToolkitStorageKey('privacy-mode');

    if (toggle) {
      $('body').addClass('tk-privacy-mode');
      $('#tk-toggle-privacy i')
        .removeClass('unlock-1')
        .addClass('lock-1');
    } else {
      $('body').removeClass('tk-privacy-mode');
      $('#tk-toggle-privacy i')
        .removeClass('lock-1')
        .addClass('unlock-1');
    }
  }
}
