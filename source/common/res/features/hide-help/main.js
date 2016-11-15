(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.hideHelp = (function () {
      return {
        invoke() {
          // hide button by default
          $('#hs-beacon').hide();
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
            let accountController = ynabToolKit.shared.containerLookup('controller:accounts');
            $('#hs-beacon').toggle();
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
