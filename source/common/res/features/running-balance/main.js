'use strict';

(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.runningBalance = (function () {
      var currentlyRunning = false;

      function updateRunningBalanceCalculation(arrangedContent) {
        var i;
        var transaction;
        var runningBalance = 0;

        var accountController = ynabToolKit.shared.containerLookup('controller:accounts');
        if (accountController.get('sortAscending')) {
          for (i = 0; i < arrangedContent.length; i++) {
            transaction = arrangedContent[i];

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
        } else {
          for (i = arrangedContent.length - 1; i >= 0; i--) {
            transaction = arrangedContent[i];

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
        var accountController = ynabToolKit.shared.containerLookup('controller:accounts');

        if (accountController.get('sortProperties').indexOf('date') !== -1) {
          updateRunningBalanceCalculation(accountController.get('arrangedContent'));
          updateRunningBalanceColumn();
        } else {
          $('.ynab-toolkit-grid-cell-running-balance').remove();
        }
      }

      function addDeadColumnToAddRows() {
        var $ynabGridAddRows = $('.ynab-grid-add-rows');

        if ($ynabGridAddRows.children().length) {
          if ($('.ynab-toolkit-grid-cell-running-balance', $ynabGridAddRows).length) return;
          $('<div class="ynab-grid-cell ynab-toolkit-grid-cell-running-balance">').insertAfter($('.ynab-grid-cell-inflow', $ynabGridAddRows));
        }
      }

      return {
        invoke: function () {
          currentlyRunning = true;

          Ember.run.next(function () {
            var applicationController = ynabToolKit.shared.containerLookup('controller:application');

            if (applicationController.get('currentPath').indexOf('accounts') > -1 && applicationController.get('selectedAccountId')) {
              onYnabGridyBodyChanged();
            }

            currentlyRunning = false;
          });
        },

        observe: function invoke(changedNodes) {
          if (changedNodes.has('ynab-grid-body') && !currentlyRunning) {
            ynabToolKit.runningBalance.invoke();
          }

          if (changedNodes.has('ynab-grid-cell ynab-grid-cell-accountName user-data') &&
              changedNodes.has('ynab-grid-cell ynab-grid-cell-date user-data')
          ) {
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
