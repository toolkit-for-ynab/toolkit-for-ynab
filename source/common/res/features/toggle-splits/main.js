(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.toggleSplits = (function () {
      function hideSubTransactions() {
        ynabToolKit.toggleSplits.setting = 'hide';
        $('.ynab-grid-body .ynab-grid-body-sub:not(.is-editing)').hide();
        $(".ynab-grid-cell-subCategoryName[title^='Split']").css('font-weight', 700);
        // setDisplayEnd();
      }

      function showSubTransactions() {
        ynabToolKit.toggleSplits.setting = 'show';
        $('.ynab-grid-body .ynab-grid-body-sub').show();
        $(".ynab-grid-cell-subCategoryName[title^='Split']").css('font-weight', '');
      }

      return {
        setting: 'init',
        invoke: function invoke() {
          // default the right arrow to hidden
          if (ynabToolKit.toggleSplits.setting === 'init' || ynabToolKit.toggleSplits.setting === 'hide') {
            $('#toggle-splits > .down').hide();
            hideSubTransactions();
          } else {
            showSubTransactions();
          }

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
