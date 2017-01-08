(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.hideHelp = (function () {
      return {
        hideHelp: 'true',

        invoke() {
          let hideHelp = ynabToolKit.shared.getToolkitStorageKey('hide-help');

          if (hideHelp === null) {
            ynabToolKit.shared.setToolkitStorageKey('hide-help', 'true');
            hideHelp = 'true';
          }

          if (hideHelp === 'true') {
            $('body').addClass('toolkit-hide-help');
          }
        },

        observe(changedNodes) {
          if (changedNodes.has('ynab-u modal-popup modal-user-prefs ember-view modal-overlay active')) {
            ynabToolKit.hideHelp.updatePopup();
          }
        },

        updatePopup() {
          let $modal = $('.modal-user-prefs .modal');
          let $modalList = $('.modal-user-prefs .modal-list');

          if ($('.ynab-toolkit-hide-help', $modalList).length) return;

          let $label = 'Show';
          if ($('#hs-beacon').is(':visible')) { $label = 'Hide'; }

          $(`<li class="ynab-toolkit-hide-help">
            <button>
              <i class="flaticon stroke help-2"></i>
              ` + $label + ` Help Button
            </button>
           </li>
          `).click(() => {
            ynabToolKit.hideHelp.hideHelp = !ynabToolKit.hideHelp.hideHelp;
            ynabToolKit.shared.setToolkitStorageKey('hide-help', ynabToolKit.hideHelp.hideHelp);
            $('body').toggleClass('toolkit-hide-help');
            let accountController = ynabToolKit.shared.containerLookup('controller:accounts');
            accountController.send('closeModal');
          }).appendTo($modalList);

          $modal.css({ height: '+=12px' });
        }
      };
    }()); // Keep feature functions contained within this object

    ynabToolKit.hideHelp.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
