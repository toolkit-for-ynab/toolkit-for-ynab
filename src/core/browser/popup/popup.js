import { ToolkitStorage } from 'toolkit/core/common/storage';
import { getBrowser, getBrowserName } from 'toolkit/core/common/web-extensions';

const TOOLKIT_DISABLED_FEATURE_SETTING = 'DisableToolkit';

export class Popup {
  _storage = new ToolkitStorage();

  _browser = getBrowser();

  constructor() {
    const manifest = this._browser.runtime.getManifest();
    $('#versionNumber').text(manifest.version);
    $('.toolkit-name').text(manifest.name);

    Promise.all([
      this._storage.getFeatureSetting('options.dark-mode', { default: false }),
      this._storage.getFeatureSetting(TOOLKIT_DISABLED_FEATURE_SETTING, {
        default: false,
      }),
    ]).then(([isDarkMode, isToolkitDisabled]) => {
      this._applyDarkMode(isDarkMode);
      this._toggleToolkitDisabledUI(isToolkitDisabled);
    });
  }

  initListeners() {
    $('#reportBug').click(() => {
      setTimeout(() => window.close(), 50);
    });
    $('#openSettings').click(this._openOptionsPage);
    $('#logo').click(this._toggleToolkitDisabledSetting);
    $('#toggleToolkit').click(this._toggleToolkitDisabledSetting);

    this._storage.onFeatureSettingChanged(
      TOOLKIT_DISABLED_FEATURE_SETTING,
      this._toggleToolkitDisabledUI
    );
  }

  _applyDarkMode = isDarkMode => {
    if (isDarkMode) {
      $('body').addClass('inverted');
    } else {
      $('body').removeClass('inverted');
    }
  };

  _openOptionsPage = () => {
    if (getBrowserName() === 'edge') {
      this._browser.tabs.create({
        url: this._browser.runtime.getURL('options/index.html'),
      });
    } else {
      this._browser.runtime.openOptionsPage();
    }
  };

  _toggleToolkitDisabledUI = isToolkitDisabled => {
    const logoPath = `assets/images/logos/toolkitforynab-logo-200${
      isToolkitDisabled ? '-disabled' : ''
    }.png`;
    const logoURL = this._browser.runtime.getURL(logoPath);
    $('#logo').attr('src', logoURL);
    $('#toggleToolkit > i')
      .addClass(isToolkitDisabled ? 'fa-toggle-off' : 'fa-toggle-on')
      .removeClass(isToolkitDisabled ? 'fa-toggle-on' : 'fa-toggle-off');
  };

  _toggleToolkitDisabledSetting = () => {
    this._storage
      .getFeatureSetting(TOOLKIT_DISABLED_FEATURE_SETTING, { default: false })
      .then(isDisabled => {
        this._storage.setFeatureSetting(TOOLKIT_DISABLED_FEATURE_SETTING, !isDisabled);
      });
  };
}
