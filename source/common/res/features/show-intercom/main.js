(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.showIntercom = (function () {
      return {
        invoke() {
          let $modal = $('.modal-user-prefs .modal');
          let $modalList = $('.modal-user-prefs .modal-list');

          if ($('.ynab-toolkit-show-intercom', $modalList).length) return;

          $(`<li class="ynab-toolkit-show-intercom">
              <button>
                <i class="flaticon stroke warning-2"></i>
                Show Intercom
              </button>
             </li>
          `).click(() => {
            let accountController = ynabToolKit.shared.containerLookup('controller:accounts');
            Intercom('show'); // eslint-disable-line new-cap
            accountController.send('closeModal');
          }).appendTo($modalList);

          $modal.css({ height: '+=10px' });
        },

        observe(changedNodes) {
          if (changedNodes.has('ynab-u modal-popup modal-user-prefs ember-view modal-overlay active')) {
            ynabToolKit.showIntercom.invoke();
          }
        }
      };
    }()); // Keep feature functions contained within this object
  } else {
    setTimeout(poll, 250);
  }
}());
