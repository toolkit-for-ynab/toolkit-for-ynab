'use strict';

(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.runningBalance = (function () {
      var sortedContent;
      var currentlyRunning = false;

      function sortContent(content) {
        // if we have sorted content already and it has the same amount of transactions
        // as unsorted content, just get out. this will not catch changes made to a transaction...
        if (sortedContent && sortedContent.length === content.length) {
          return;
        }

        sortedContent = content.slice().sort(function (a, b) {
          return a.date.toNativeDate() - b.date.toNativeDate();
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
        var accountController = ynabToolKit.shared.containerLookup('controller:accounts');

        sortContent(accountController.get('content'));
        updateRunningBalanceCalculation();
        updateRunningBalanceColumn();
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