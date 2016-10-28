(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.toggleSplits = (function () {
      // let grid = ynabToolKit.shared.getEmberView($('.ynab-grid').attr('id'));
      // // let accountsController = ynabToolKit.shared.containerLookup('controller:accounts');
      // grid.reopen({
      //   __toolkitShowSubTransactions: false,
      //   content: Ember.computed({
      //     // get: function () { return []; },
      //     get: function () {
      //       console.log(this);
      //       // if (!this.get('__toolkitShowSubTransactions')) {
      //       //   val = val.filter((transaction) => {
      //       //     let displayItemType = transaction.get('displayItemType');
      //       //     return displayItemType !== ynab.constants.TransactionDisplayItemType.SubTransaction &&
      //       //            displayItemType !== ynab.constants.TransactionDisplayItemType.ScheduledSubTransaction;
      //       //   });
      //       // }
      //       // return val;
      //     }
      //   })
      // });

      function hideSubTransactions() {
        ynabToolKit.toggleSplits.setting = 'hide';
        // grid.set('__toolkitShowSubTransactions', false);
        $('.ynab-grid-body .ynab-grid-body-sub:not(.is-editing)').hide();
        $(".ynab-grid-cell-subCategoryName[title^='Split']").css('font-weight', 700);
      }

      function showSubTransactions() {
        ynabToolKit.toggleSplits.setting = 'show';
        // grid.set('__toolkitShowSubTransactions', true);
        $('.ynab-grid-body .ynab-grid-body-sub').show();
        $(".ynab-grid-cell-subCategoryName[title^='Split']").css('font-weight', '');
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
          if (changedNodes.has('ynab-grid-body')) {
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
