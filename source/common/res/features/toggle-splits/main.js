(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.toggleSplits = (function () {
      let isToggling = false;
      let accountsController = ynabToolKit.shared.containerLookup('controller:accounts');
      accountsController.reopen({
        toolkitShowSubTransactions: false,
        contentResults: Ember.computed({
          get: function () { return []; },
          set: function (key, val) {
            if (!this.get('toolkitShowSubTransactions')) {
              val = val.filter((transaction) => {
                let displayItemType = transaction.get('displayItemType');
                return displayItemType !== ynab.constants.TransactionDisplayItemType.SubTransaction &&
                       displayItemType !== ynab.constants.TransactionDisplayItemType.ScheduledSubTransaction;
              });
            }
            return val;
          }
        })
      });


      function hideSubTransactions() {
        isToggling = true;
        ynabToolKit.toggleSplits.setting = 'hide';
        accountsController.set('toolkitShowSubTransactions', false);
        Ember.run.debounce(accountsController, accountsController._filterContent, 25);
      }

      function showSubTransactions() {
        isToggling = true;
        ynabToolKit.toggleSplits.setting = 'show';
        accountsController.set('toolkitShowSubTransactions', true);
        Ember.run.debounce(accountsController, accountsController._filterContent, 25);
      }

      return {
        setting: 'init',
        invoke: function invoke() {
          if (!$('#toggle-splits').length) {
            var buttonText = ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.toggleSplits'] || 'Toggle Splits';

            $('<button>', { id: 'toggle-splits', class: 'ember-view button' })
              .append($('<i>', { class: 'ember-view flaticon stroke right' }))
              .append($('<i>', { class: 'ember-view flaticon stroke down' }))
              .append(' ' + buttonText)
              .insertAfter('.accounts-toolbar .undo-redo-container');

            $('.accounts-toolbar-left').find('#toggle-splits').click(function () {
              if (ynabToolKit.toggleSplits.setting === 'hide') {
                showSubTransactions();
              } else {
                hideSubTransactions();
              }

              $('#toggle-splits > i').toggle();
            });
          }

          // default the right arrow to hidden
          if (ynabToolKit.toggleSplits.setting === 'init' || ynabToolKit.toggleSplits.setting === 'hide') {
            $('#toggle-splits > .down').hide();
            hideSubTransactions();
          } else {
            showSubTransactions();
          }
        },

        observe: function observe(changedNodes) {
          if (changedNodes.has('ynab-grid-body') && !isToggling) {
            ynabToolKit.toggleSplits.invoke();
          }
        }
      };
    }());

    let router = ynabToolKit.shared.containerLookup('router:main');
    if (router.get('currentPath').indexOf('accounts') > -1) {
      ynabToolKit.toggleSplits.invoke();
    }
  } else {
    setTimeout(poll, 250);
  }
}());
