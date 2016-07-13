(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.toggleSplits = (function () {
      // Supporting functions,
      // or variables, etc
      function setDisplayEnd() {
        var rowView = ynabToolKit.shared.getEmberViewByContainerKey('view:ynab-grid/rows');
        var accountsController = ynabToolKit.shared.containerLookup('controller:accounts');
        var containerView = rowView.get('containerView');
        var content = accountsController.get('contentResults');
        var displayStart = containerView.get('displayStart');
        var displayEnd = containerView.get('displayEnd');
        var wantToDisplay = displayEnd - displayStart;
        var displayedCount = 0;

        for (var i = this.get('displayStart'); i < content.length; i++) {
          if (displayedCount === wantToDisplay) break;

          if (content[i].parentEntityId) {
            displayedCount++;
          } else {
            continue;
          }
        }

        Ember.run.next(function () {
          containerView.set('displayEnd', displayStart + wantToDisplay + displayedCount);
        });
      }

      function addScrollListener() {
        var rowView = ynabToolKit.shared.getEmberViewByContainerKey('view:ynab-grid/rows');
        removeScrollListener();
        rowView.get('containerView').addObserver('scrollTop', setDisplayEnd);
      }

      function removeScrollListener() {
        var rowView = ynabToolKit.shared.getEmberViewByContainerKey('view:ynab-grid/rows');
        rowView.get('containerView').removeObserver('scrollTop', setDisplayEnd);
      }

      return {
        setting: 'init',
        invoke() {
          if (!$('#toggleSplits').length) {
            var buttonText = (ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.toggleSplits']) || 'Toggle Splits';

            $('<button>', { id: 'toggleSplits', class: 'ember-view button' }).append(
              $('<i>', { class: 'ember-view flaticon stroke right' })
            )
            .append(
              $('<i>', { class: 'ember-view flaticon stroke down' })
            )
            .append(
              ' ' + buttonText
            )
            .insertAfter('.accounts-toolbar .undo-redo-container');

            $('.accounts-toolbar-left').find('#toggleSplits').click(function () {
              if (ynabToolKit.toggleSplits.setting === 'hide') {
                ynabToolKit.toggleSplits.setting = 'show'; // invert setting
                $('.ynab-grid-body-sub').show();
              } else {
                ynabToolKit.toggleSplits.setting = 'hide';
                $('.ynab-grid-body-sub').hide();
              }

              $('#toggleSplits > i').toggle();
            });

            addScrollListener();
          }

          // default the right arrow to hidden
          if (ynabToolKit.toggleSplits.setting === 'init' || ynabToolKit.toggleSplits.setting === 'hide') {
            $('#toggleSplits > .down').hide();
            $('.ynab-grid-body-sub').hide();
            ynabToolKit.toggleSplits.setting = 'hide';
          } else {
            $('.ynab-grid-body-sub').show();
          }

          $(".ynab-grid-cell-subCategoryName[title^='Split']").each(function () {
            $(this).html(
              $(this).html().replace(/Split/g, '<span class="split-transaction">Split</span>')
            );
          });
        },

        observe(changedNodes) {
          if (changedNodes.has('ynab-grid-body')) {
            // We found Account transactions rows
            ynabToolKit.toggleSplits.invoke();
          }
        }
      };
    }()); // Keep feature functions contained within this object
  } else {
    setTimeout(poll, 250);
  }
}());
