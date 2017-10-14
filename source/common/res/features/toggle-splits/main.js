(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.toggleSplits = (function () {
      let isToggling = false;
      let accountsController = ynabToolKit.shared.containerLookup('controller:accounts');
      let ynabContentResults = accountsController.contentResults;
      accountsController.reopen({
        toolkitShowSubTransactions: false,
        contentResults: Ember.computed(...ynabContentResults._dependentKeys, {
          get: function () {
            let contentResults = ynabContentResults._getter.apply(this);
            if (!this.get('toolkitShowSubTransactions')) {
              contentResults = contentResults.filter((transaction) => {
                let displayItemType = transaction.get('displayItemType');
                return displayItemType !== ynab.constants.TransactionDisplayItemType.SubTransaction &&
                       displayItemType !== ynab.constants.TransactionDisplayItemType.ScheduledSubTransaction;
              });
            }

            return contentResults;
          },
          set: function (_key, val) {
            // ynab shouldn't be calling set on contentResults but if they ever do
            // we'll just pass that through as normal
            return val;
          }
        })
      });

      function hideSubTransactions() {
        isToggling = true;
        ynabToolKit.toggleSplits.setting = 'hide';
        accountsController.set('toolkitShowSubTransactions', false);
        Ember.run.debounce(accountsController, () => {
          accountsController.notifyPropertyChange('contentResults');
        }, 25);
      }

      function showSubTransactions() {
        isToggling = true;
        ynabToolKit.toggleSplits.setting = 'show';
        accountsController.set('toolkitShowSubTransactions', true);
        Ember.run.debounce(accountsController, () => {
          accountsController.notifyPropertyChange('contentResults');
        }, 25);
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

            $('.accounts-toolbar-left').addClass('toolkit-accounts-toolbar-left');

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
            $('#toggle-splits > .right').hide();
            showSubTransactions();
          }
        },

        observe: function observe(changedNodes) {
          if (changedNodes.has('ynab-grid-body') && !isToggling) {
            ynabToolKit.toggleSplits.invoke();
          }
        },

        onRouteChanged: function onRouteChanged(changedRoute) {
          if (changedRoute.indexOf('accounts') > -1) {
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
