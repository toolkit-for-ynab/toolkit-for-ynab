import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

const Settings = {
  AlwaysOn: '1',
  Toggle: '2',
};

const TEXT_BLUR_FILTER_ID = 'text-blur';

const PRIVACY_TOOLKIT_STORAGE_KEY = 'privacy-mode';

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
    let toggle = getToolkitStorageKey(PRIVACY_TOOLKIT_STORAGE_KEY);
    if (typeof toggle === 'undefined') {
      setToolkitStorageKey(PRIVACY_TOOLKIT_STORAGE_KEY, false);
    }

    if (!$(`#${TEXT_BLUR_FILTER_ID}`).length) {
      $('body').append(this._getBlurSVG());
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
      setToolkitStorageKey(PRIVACY_TOOLKIT_STORAGE_KEY, true);
    }

    this.updatePrivacyMode();
  }

  onRouteChanged() {
    this.invoke();
  }

  togglePrivacyMode() {
    $('#tk-toggle-privacy').toggleClass('active');

    let toggle = getToolkitStorageKey(PRIVACY_TOOLKIT_STORAGE_KEY);
    setToolkitStorageKey(PRIVACY_TOOLKIT_STORAGE_KEY, !toggle);
    this.updatePrivacyMode();
  }

  updatePrivacyMode() {
    let toggle = getToolkitStorageKey(PRIVACY_TOOLKIT_STORAGE_KEY);

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

  _getBlurSVG() {
    return /* html */ `
      <svg version="1.1" width="0" height="0">
        <defs>
          <filter id="text-blur">
            <feGaussianBlur stdDeviation="6" result="blur" />
          </filter>
        </defs>
      </svg>
    `;
  }
}
