(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.spareChange = (function () {
      var selectedTransactions;
      var currentlyRunning = false;

      function setSelectedTransactions() {
        var accountController = ynabToolKit.shared.containerLookup('controller:accounts');
        var visibleTransactionDisplayItems = accountController.get('visibleTransactionDisplayItems');
        selectedTransactions = visibleTransactionDisplayItems.filter(i => i.isChecked && i.get('outflow'));
      }

      function getSelectedAccount() {
        var applicationController = ynabToolKit.shared.containerLookup('controller:application');
        var selectedAccountId = applicationController.get('selectedAccountId');

        if (selectedAccountId) {
          var accountController = ynabToolKit.shared.containerLookup('controller:accounts');
          var selectedAccounts = accountController.get('activeAccounts');
          var selectedAccount = selectedAccounts.find(a => a.itemId === selectedAccountId);

          return selectedAccount;
        }

        return null;
      }

      function updateSpareChangeCalculation() {
        var i;
        var transaction;
        var runningSpareChange = 0;

        var selectedAccount = getSelectedAccount();
        if (selectedAccount) {
          for (i = 0; i < selectedTransactions.length; i++) {
            transaction = selectedTransactions[i];

            if (transaction.get('parentEntityId') !== null) {
              continue;
            }

            if (transaction.get('outflow')) {
              var amount = ynab.convertFromMilliDollars(transaction.get('outflow'));
              var nextDollar = Math.ceil(amount);
              var spareChangeForThisRow = nextDollar - amount;
              runningSpareChange += ynab.convertToMilliDollars(spareChangeForThisRow);
            }

            selectedAccount.__ynabToolKitSpareChange = runningSpareChange;
          }
        }
      }

      function updateSpareChangeHeader() {
        if (selectedTransactions.length > 0) {
          insertHeader();
          updateValue();
        } else {
          removeHeader();
        }
      }

      function insertHeader() {
        var balancesHeader = $('.accounts-header-balances');

        var spareChangeDiv = $('.ynab-toolkit-accounts-header-balances-spare-change');
        var selectedTotalDiv = $('.accounts-header-selected-total');
        var flexGrowSpacer = $('.ynab-toolkit-spare-change-flex-grow-spacer');
        var separator = $('.accounts-header-balances > i:contains("***")');
        var isSelectedTotalVisible = selectedTotalDiv.length > 0;

        spareChangeDiv.remove();
        flexGrowSpacer.remove();
        separator.remove();

        spareChangeDiv = $('<div />')
          .addClass('ynab-toolkit-accounts-header-balances-spare-change');

        var spareChangeAmount = $('<span />').addClass('user-data');
        var spareChangeTitle =
          $('<div />')
            .addClass('accounts-header-balances-label')
            .attr('title', 'The selected items "spare change" when rounded up to the nearest dollar.')
            .text('Spare Change');

        var currencySpan = $('<span />').addClass('user-data currency');

        spareChangeAmount.append(currencySpan);
        spareChangeDiv.append(spareChangeTitle);
        spareChangeDiv.append(spareChangeAmount);

        if (isSelectedTotalVisible) {
          spareChangeDiv.insertBefore(selectedTotalDiv);
          separator = $('<i />').text('***');
          separator.insertAfter(spareChangeDiv);
        } else {
          spareChangeDiv.css('margin-right', '32px');
          balancesHeader.append(spareChangeDiv);
        }

        flexGrowSpacer = $('<div />')
          .addClass('ynab-toolkit-spare-change-flex-grow-spacer')
          .css('flex-grow', '1');
        flexGrowSpacer.insertBefore(spareChangeDiv);
      }

      function removeHeader() {
        $('.ynab-toolkit-accounts-header-balances-spare-change').remove();
        $('.accounts-header-balances > i:contains("***")').remove();
        $('.ynab-toolkit-spare-change-flex-grow-spacer').remove();
      }

      function updateValue() {
        var selectedAccount = getSelectedAccount();
        if (selectedAccount) {
          var spareChange = selectedAccount.__ynabToolKitSpareChange;

          var spareChangeHeader = $('.ynab-toolkit-accounts-header-balances-spare-change');
          var spareChangeAmount = $('.user-data:not(.currency)', spareChangeHeader);
          var currencySpan = $('.user-data.currency', spareChangeHeader);

          currencySpan.removeClass('negative positive zero');

          if (spareChange < 0) {
            currencySpan.addClass('negative');
          } else if (spareChange > 0) {
            currencySpan.addClass('positive');
          } else {
            currencySpan.addClass('zero');
          }

          var formatted = ynabToolKit.shared.formatCurrency(spareChange);
          spareChangeAmount.attr('title', formatted.string);

          var formattedHtml = formatted.string.replace(/\$/g, '<bdi>$</bdi>');
          currencySpan.html(formattedHtml);
        }
      }

      function onYnabGridyBodyChanged() {
        Ember.run.debounce(function () {
          setSelectedTransactions();
          updateSpareChangeCalculation();
          updateSpareChangeHeader();
        }, 250);
      }

      function onYnabSelectionChanged() {
        selectedTransactions = undefined;
        onYnabGridyBodyChanged();
      }

      return {
        // invoke has potential of being pretty processing heavy (needing to sort content, then update calculation for every row)
        // wrapping it in a debounce means that if the user continuously scrolls down we won't clog up the event loop.
        invoke: function invoke() {
          currentlyRunning = true;

          Ember.run.debounce(function () {
            var applicationController = ynabToolKit.shared.containerLookup('controller:application');
            var accountsController = ynabToolKit.shared.containerLookup('controller:accounts');

            accountsController.addObserver('areChecked', onYnabSelectionChanged);

            if (applicationController.get('currentPath').indexOf('accounts') > -1) {
              if (applicationController.get('selectedAccountId')) {
                onYnabGridyBodyChanged();
              } else {
                removeHeader();
              }
            }

            currentlyRunning = false;
          }, 250);
        },

        observe: function invoke(changedNodes) {
          if (changedNodes.has('ynab-grid-body') && !currentlyRunning) {
            ynabToolKit.spareChange.invoke();
          }
        }
      };
    }());

    ynabToolKit.spareChange.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
