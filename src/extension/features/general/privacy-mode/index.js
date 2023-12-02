import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

const Settings = {
  AlwaysOn: '1',
  Toggle: '2',
};

const TEXT_BLUR_SVG_ID = 'tk-privacy-mode-svg';
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
              $(`<svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 50 50">
<path d="M 25 3 C 18.363281 3 13 8.363281 13 15 L 13 20 L 9 20 C 7.355469 20 6 21.355469 6 23 L 6 47 C 6 48.644531 7.355469 50 9 50 L 41 50 C 42.644531 50 44 48.644531 44 47 L 44 23 C 44 21.355469 42.644531 20 41 20 L 37 20 L 37 15 C 37 8.363281 31.636719 3 25 3 Z M 25 5 C 30.566406 5 35 9.433594 35 15 L 35 20 L 15 20 L 15 15 C 15 9.433594 19.433594 5 25 5 Z M 9 22 L 41 22 C 41.554688 22 42 22.445313 42 23 L 42 47 C 42 47.554688 41.554688 48 41 48 L 9 48 C 8.445313 48 8 47.554688 8 47 L 8 23 C 8 22.445313 8.445313 22 9 22 Z M 25 30 C 23.300781 30 22 31.300781 22 33 C 22 33.898438 22.398438 34.6875 23 35.1875 L 23 38 C 23 39.101563 23.898438 40 25 40 C 26.101563 40 27 39.101563 27 38 L 27 35.1875 C 27.601563 34.6875 28 33.898438 28 33 C 28 31.300781 26.699219 30 25 30 Z"></path>
</svg>`).css({ fill: 'currentColor' })
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

  destroy() {
    $('#tk-toggle-privacy').remove();
    $('body').removeClass('tk-privacy-mode');
    $(`#${TEXT_BLUR_SVG_ID}`).remove();
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
      $('#tk-toggle-privacy i').removeClass('unlock-1').addClass('lock-1');
    } else {
      $('body').removeClass('tk-privacy-mode');
      $('#tk-toggle-privacy i').removeClass('lock-1').addClass('unlock-1');
    }
  }

  _getBlurSVG() {
    return /* html */ `
      <svg id="${TEXT_BLUR_SVG_ID}" version="1.1" width="0" height="0">
        <defs>
          <filter id="${TEXT_BLUR_FILTER_ID}">
            <feGaussianBlur stdDeviation="6" result="blur" />
          </filter>
        </defs>
      </svg>
    `;
  }
}
