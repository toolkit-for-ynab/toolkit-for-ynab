(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.privacyMode = (function () {
      function togglePrivacyMode() {
        $('button#toolkit-togglePrivacy').toggleClass('active');

        let toggle = ynabToolKit.shared.getToolkitStorageKey('privacy-mode', 'boolean');
        ynabToolKit.shared.setToolkitStorageKey('privacy-mode', !toggle);
        updatePrivacyMode();
      }

      function updatePrivacyMode() {
        let toggle = ynabToolKit.shared.getToolkitStorageKey('privacy-mode', 'boolean');

        if (toggle) {
          $('body').addClass('toolkit-privacyMode');
          $('#toolkit-togglePrivacy i').removeClass('unlock-1').addClass('lock-1');
        } else {
          $('body').removeClass('toolkit-privacyMode');
          $('#toolkit-togglePrivacy i').removeClass('lock-1').addClass('unlock-1');
        }
      }

      return {
        invoke() {
          let toggle = ynabToolKit.shared.getToolkitStorageKey('privacy-mode', 'boolean');
          if (typeof toggle === 'undefined') {
            ynabToolKit.shared.setToolkitStorageKey('privacy-mode', false);
          }

          if (ynabToolKit.options.privacyMode === '2') {
            if (!$('#toolkit-togglePrivacy').length) {
              $('nav.sidebar.logged-in .sidebar-contents').after('<button id="toolkit-togglePrivacy"><i class="ember-view flaticon stroke lock-1"></i></button>');
              $('body').on('click', 'button#toolkit-togglePrivacy', togglePrivacyMode);
            }
          } else if (ynabToolKit.options.privacyMode === '1') {
            ynabToolKit.shared.setToolkitStorageKey('privacy-mode', true);
          }

          updatePrivacyMode();
        }
      };
    }()); // Keep feature functions contained within this

    ynabToolKit.privacyMode.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
