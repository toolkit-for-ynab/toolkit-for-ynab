(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.closeReconcileWindow = (function () {
      return {
        observe(changedNodes) {
          if (changedNodes.has('modal-account-reconcile-current') && changedNodes.has('flaticon stroke checkmark-2')) {
            if ($('.modal-account-reconcile-reconciled').length) {
              setTimeout(function () {
                $('.modal-account-reconcile-reconciled').fadeOut(function () {
                  $('.modal-account-reconcile').click();
                });
              }, 1500);
            }
          }
        }
      };
    }());
  } else {
    setTimeout(poll, 250);
  }
}());
