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
    let toggle = getToolkitStorageKey('privacy-mode');
    if (typeof toggle === 'undefined') {
      setToolkitStorageKey('privacy-mode', false);
    }

    if (ynabToolKit.options.PrivacyMode === Settings.Toggle) {
      if (!$('#toolkit-togglePrivacy').length) {
        $('nav.sidebar.logged-in .sidebar-contents').after(
          '<button id="toolkit-togglePrivacy"><i class="ember-view flaticon stroke lock-1"></i></button>'
        );

        let parent = this;
        $('body').on('click', 'button#toolkit-togglePrivacy', function() {
          parent.togglePrivacyMode();
        });
      }
    } else if (ynabToolKit.options.PrivacyMode === Settings.AlwaysOn) {
      setToolkitStorageKey('privacy-mode', true);
    }

    this.updatePrivacyMode();
  }

  togglePrivacyMode() {
    $('button#toolkit-togglePrivacy').toggleClass('active');

    let toggle = getToolkitStorageKey('privacy-mode');
    setToolkitStorageKey('privacy-mode', !toggle);
    this.updatePrivacyMode();
  }

  updatePrivacyMode() {
    let toggle = getToolkitStorageKey('privacy-mode');

    if (toggle) {
      $('body').addClass('toolkit-privacyMode');
      $('#toolkit-togglePrivacy i')
        .removeClass('unlock-1')
        .addClass('lock-1');
    } else {
      $('body').removeClass('toolkit-privacyMode');
      $('#toolkit-togglePrivacy i')
        .removeClass('lock-1')
        .addClass('unlock-1');
    }
  }
}
