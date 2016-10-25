(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.enterInRegisterNow = (function () {
      let accountsController;
      let transactionViewModel;

      // this function was taken pretty much verbatim from YNAB source code
      // they have a function called generateUpcomingTransactionNow which takes
      // a list of entity ids to generate.
      function enterTransactionInRegisterNow(transactionsToEnter) {
        let entityManger = transactionViewModel.getEntityManager();
        entityManger.openChangeSet();

        let transactionIds = transactionsToEnter.map((t) => t.get('entityId'));

        try {
          transactionViewModel.getYNABDatabase()
            .generateUpcomingTransactionNow(transactionIds)
            .then(() => {
              entityManger.closeChangeSet();
              accountsController.send('closeModal');
            });
        } catch (e) {
          accountsController.send('closeModal');
          ynabToolKit.shared.showFeatureErrorModal('Enter In Register Now');
        }
      }

      function addOptionToContextMenu() {
        let selectedTransactions = accountsController.get('areChecked');
        let canEnterNow = selectedTransactions.every((t) => t.get('isScheduledTransaction'));

        if (!canEnterNow) return;

        $('.modal-account-edit-transaction-list .modal-list')
          .prepend(
            $(`<li>
                <button class="button-list ynab-toolkit-enter-in-register-now">
                  <i class="flaticon stroke share-2"></i>
                  Enter In Register Now
                </button>
              </li>`).click(() => {
                enterTransactionInRegisterNow(selectedTransactions);
              })
          );
      }

      return {
        invoke() {
          accountsController = ynabToolKit.shared.containerLookup('controller:accounts');
          transactionViewModel = accountsController.get('transactionViewModel');
          addOptionToContextMenu();
        },

        observe(changedNodes) {
          if (changedNodes.has('ynab-u modal-popup\nmodal-account-edit-transaction-list ember-view modal-overlay active')) {
            ynabToolKit.enterInRegisterNow.invoke();
          }
        }
      };
    }());

    ynabToolKit.enterInRegisterNow.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
