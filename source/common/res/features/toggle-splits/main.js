(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.toggleSplits = (function () {
      var calculatingDisplayEnd = false;

      function setDisplayEnd() {
        if (ynabToolKit.toggleSplits.setting === 'show') return;

        calculatingDisplayEnd = true;
        var rowView = ynabToolKit.shared.getEmberViewByContainerKey('view:ynab-grid/rows');
        var accountsController = ynabToolKit.shared.containerLookup('controller:accounts');
        var contentResults = accountsController.get('contentResults');
        var containerView = rowView.get('containerView');
        var gridView = rowView.get('gridView');
        var displayStart = containerView.get('displayStart');
        var recordsPerBody = containerView.get('recordsPerBody');

        // this calculation was taken from YNAB's current codebase
        var wouldBeDisplayEnd = Math.round(Math.min(displayStart + 4 * recordsPerBody, gridView.get('total')));

        var fitOnPage = wouldBeDisplayEnd - displayStart;
        var displayedCount = 0;
        var displayEnd = displayStart;

        for (var i = displayStart; i < contentResults.length; i++) {
          if (displayedCount === fitOnPage) break;

          if (contentResults[i].get('parentEntityId')) {
            if (ynabToolKit.toggleSplits.setting === 'hide') {
              displayEnd++;
              continue;
            } else {
              displayedCount++;
            }
          } else {
            displayedCount++;
            displayEnd++;
          }
        }

        Ember.run.next(function () {
          containerView.set('displayEnd', displayEnd);
          calculatingDisplayEnd = false;
        });
      }

      function addScrollListener() {
        var rowView = ynabToolKit.shared.getEmberViewByContainerKey('view:ynab-grid/rows');
        rowView.get('containerView').addObserver('scrollTop', setDisplayEnd);

        if (rowView.get('containerView').get('scrollTop') === 0) {
          setDisplayEnd();
        }
      }

      function hideSubTransactions() {
        ynabToolKit.toggleSplits.setting = 'hide';
        $('.ynab-grid-body .ynab-grid-body-sub:not(.is-editing)').hide();
        $(".ynab-grid-cell-subCategoryName[title^='Split']").css('font-weight', 700);
        setDisplayEnd();
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

            addScrollListener();
          }
        },

        observe: function observe(changedNodes) {
          if (changedNodes.has('ynab-grid-body')) {
            ynabToolKit.toggleSplits.invoke();
            if (!calculatingDisplayEnd) {
              setDisplayEnd();
            }
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
