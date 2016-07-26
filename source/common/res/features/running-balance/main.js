(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.runningBalance = (function () {
      var sortedContent;
      var currentlyRunning = false;

      function setSortContent() {
        var accountController = ynabToolKit.shared.containerLookup('controller:accounts');
        var visibleTransactionDisplayItems = accountController.get('visibleTransactionDisplayItems');
        var sortAscending = accountController.get('sortAscending');

        // if we have sorted content already and it has the same amount of transactions
        // as unsorted content, just get out. this will not catch changes made to a transaction...
        if (sortedContent && sortedContent.length === visibleTransactionDisplayItems.length) {
          return;
        }

        // this is the sort provided by YNAB -- they have a check to determine if the
        sortedContent = visibleTransactionDisplayItems.slice().sort(function (a, b) {
          var propA = a.get('date');
          var propB = b.get('date');

          if (propA instanceof ynab.utilities.DateWithoutTime) propA = propA.getUTCTime();
          if (propB instanceof ynab.utilities.DateWithoutTime) propB = propB.getUTCTime();

          var res = Ember.compare(propA, propB);

          if (res === 0) {
            res = Ember.compare(a.getAmount(), b.getAmount());
            if (sortAscending) {
              return res;
            }

            return -res;
          }

          return res;
        });
      }

      function updateRunningBalanceCalculation() {
        var i;
        var transaction;
        var runningBalance = 0;

        for (i = 0; i < sortedContent.length; i++) {
          transaction = sortedContent[i];

          if (transaction.get('parentEntityId') !== null) {
            transaction.__ynabToolKitRunningBalance = runningBalance;
            continue;
          }

          if (transaction.get('inflow')) {
            runningBalance += transaction.get('inflow');
          } else if (transaction.get('outflow')) {
            runningBalance -= transaction.get('outflow');
          }

          transaction.__ynabToolKitRunningBalance = runningBalance;
        }
      }

      function updateRunningBalanceColumn() {
        insertHeader();

        $('.ynab-grid-container .ynab-grid-body .ynab-grid-body-row').each(function (index, element) {
          var $element = $(element);
          if ($element.hasClass('ynab-grid-body-empty')) return;

          insertValue(element);
        });
      }

      function insertHeader() {
        if ($('.ynab-grid-header .ynab-toolkit-grid-cell-running-balance').length) return;

        var $headerRow = $('.ynab-grid-header');
        var runningBalanceHeader = $('.ynab-grid-cell-inflow', $headerRow).clone();
        runningBalanceHeader.removeClass('ynab-grid-cell-inflow');
        runningBalanceHeader.addClass('ynab-toolkit-grid-cell-running-balance');
        runningBalanceHeader.text('RUNNING BALANCE');
        runningBalanceHeader.insertAfter($('.ynab-grid-cell-inflow', $headerRow));

        if ($('.ynab-grid-body .ynab-grid-body-row-top .ynab-toolkit-grid-cell-running-balance').length) return;
        var $topRow = $('.ynab-grid-body-row-top');
        var topRowRunningBalance = $('.ynab-grid-cell-inflow', $topRow).clone();
        topRowRunningBalance.removeClass('ynab-grid-cell-inflow');
        topRowRunningBalance.addClass('ynab-toolkit-grid-cell-running-balance');
        topRowRunningBalance.insertAfter($('.ynab-grid-cell-inflow', $topRow));
      }

      function insertValue(element) {
        var $currentRow = $(element);
        var currentRowRunningBalance = $('.ynab-grid-cell-inflow', $currentRow).clone();
        currentRowRunningBalance.removeClass('ynab-grid-cell-inflow');
        currentRowRunningBalance.addClass('ynab-toolkit-grid-cell-running-balance');

        var emberView = ynabToolKit.shared.getEmberView($currentRow.attr('id'));
        var transaction = emberView.get('content');
        var runningBalance = transaction.__ynabToolKitRunningBalance;
        var currencySpan = $('.user-data', currentRowRunningBalance);

        if (runningBalance < 0) {
          currencySpan.addClass('user-data currency negative');
        } else if (runningBalance > 0) {
          currencySpan.addClass('user-data currency positive');
        } else {
          currencySpan.addClass('user-data currency zero');
        }

        if (transaction.get('parentEntityId') !== null) {
          currencySpan.text('');
        } else {
          currencySpan.text(ynabToolKit.shared.formatCurrency(runningBalance));
        }

        currentRowRunningBalance.insertAfter($('.ynab-grid-cell-inflow', $currentRow));
      }

      function onYnabGridyBodyChanged() {
        setSortContent();
        updateRunningBalanceCalculation();
        updateRunningBalanceColumn();
      }

      function onSortAscendingChanged() {
        sortedContent = undefined;
        onYnabGridyBodyChanged();
      }

      function addDeadColumnToAddRows() {
        var $ynabGridAddRows = $('.ynab-grid-add-rows');

        if ($ynabGridAddRows.children().length) {
          if ($('.ynab-toolkit-grid-cell-running-balance', $ynabGridAddRows).length) return;
          $('<div class="ynab-grid-cell ynab-toolkit-grid-cell-running-balance">').insertAfter($('.ynab-grid-cell-inflow', $ynabGridAddRows));
        }
      }

      return {
        // invoke has potential of being pretty processing heavy (needing to sort content, then add calculation to every row)
        // wrapping it in a later means that if the user continuously scrolls down we won't clog up the event loop.
        invoke: function invoke() {
          currentlyRunning = true;

          Ember.run.later(function () {
            var applicationController = ynabToolKit.shared.containerLookup('controller:application');
            var accountsController = ynabToolKit.shared.containerLookup('controller:accounts');

            accountsController.addObserver('sortAscending', onSortAscendingChanged);

            if (applicationController.get('currentPath').indexOf('accounts') > -1) {
              if (applicationController.get('selectedAccountId')) {
                onYnabGridyBodyChanged();
              } else {
                $('.ynab-toolkit-grid-cell-running-balance').remove();
              }
            }

            currentlyRunning = false;
          }, 250);
        },

        observe: function invoke(changedNodes) {
          if (changedNodes.has('ynab-grid-body') && !currentlyRunning) {
            ynabToolKit.runningBalance.invoke();
          }

          if (changedNodes.has('ynab-grid-cell ynab-grid-cell-accountName user-data') && changedNodes.has('ynab-grid-cell ynab-grid-cell-date user-data')) {
            addDeadColumnToAddRows();
          }
        }
      };
    }());

    ynabToolKit.runningBalance.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
