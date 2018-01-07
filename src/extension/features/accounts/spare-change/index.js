import { Feature } from 'toolkit/extension/features/feature';
import * as toolkitHelper from 'toolkit/extension/helpers/toolkit';

export class SpareChange extends Feature {
  selectedTransactions;
  currentlyRunning = false;
  applicationController = null;
  accountsController = null;

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('account') > -1;
  }

  // invoke has potential of being pretty processing heavy (needing to sort content, then update calculation for every row)
  // wrapping it in a debounce means that if the user continuously scrolls down we won't clog up the event loop.
  invoke() {
    if (!this.shouldInvoke()) {
      return;
    }

    this.currentlyRunning = true;

    if (this.applicationController === null) {
      this.applicationController = toolkitHelper.controllerLookup('application');
    }

    if (this.accountsController === null) {
      this.accountsController = toolkitHelper.controllerLookup('accounts');
    }

    Ember.run.debounce(this, function () {
      this.accountsController.addObserver('areChecked', this.onYnabSelectionChanged(this));

      if (toolkitHelper.getCurrentRouteName().indexOf('accounts') > -1) {
        if (this.applicationController.get('selectedAccountId')) {
          this.onYnabGridyBodyChanged();
        } else {
          this.removeHeader();
        }
      }

      this.currentlyRunning = false;
    }, 250);
  }

  observe(changedNodes) {
    if (!this.shouldInvoke() || this.currentlyRunning) {
      return;
    }

    if (changedNodes.has('ynab-grid-body')) {
      this.invoke();
    }
  }

  setSelectedTransactions() {
    let visibleTransactionDisplayItems = this.accountsController.get('visibleTransactionDisplayItems');
    this.selectedTransactions = visibleTransactionDisplayItems.filter(i => i.isChecked && i.get('outflow'));
  }

  getSelectedAccount() {
    let selectedAccountId = this.applicationController.get('selectedAccountId');

    if (selectedAccountId) {
      let selectedAccounts = this.accountsController.get('activeAccounts');
      let selectedAccount = selectedAccounts.find(a => a.itemId === selectedAccountId);

      return selectedAccount;
    }

    return null;
  }

  updateSpareChangeCalculation() {
    let i;
    let transaction;
    let runningSpareChange = 0;

    let selectedAccount = this.getSelectedAccount();
    if (selectedAccount) {
      for (i = 0; i < this.selectedTransactions.length; i++) {
        transaction = this.selectedTransactions[i];

        if (transaction.get('parentEntityId') !== null) {
          if (transaction.get('outflow')) {
            let amount = ynab.convertFromMilliDollars(transaction.get('outflow'));
            let nextDollar = Math.ceil(amount);
            let spareChangeForThisRow = nextDollar - amount;
            runningSpareChange += ynab.convertToMilliDollars(spareChangeForThisRow);
          }

          selectedAccount.__ynabToolKitSpareChange = runningSpareChange;
        }
      }
    }
  }

  updateSpareChangeHeader() {
    if (this.selectedTransactions.length > 0) {
      this.insertHeader();
    } else {
      this.updateValue();
      this.removeHeader();
    }
  }

  insertHeader() {
    // remove existing
    $('.ynab-toolkit-accounts-header-balances-spare-change').remove();

    // build spare change div
    let spareChangeDiv = $('<div />')
      .addClass('ynab-toolkit-accounts-header-balances-spare-change');
    let spareChangeAmount = $('<span />').addClass('user-data');
    let spareChangeTitle =
      $('<div />')
        .addClass('accounts-header-balances-label')
        .attr('title', 'The selected items "spare change" when rounded up to the nearest dollar.')
        .text('Spare Change');
    let currencySpan = $('<span />').addClass('user-data currency');

    spareChangeAmount.append(currencySpan);
    spareChangeDiv.append(spareChangeTitle);
    spareChangeDiv.append(spareChangeAmount);

    // insert
    $('.accounts-header-balances-right').prepend(spareChangeDiv);
  }

  removeHeader() {
    $('.ynab-toolkit-accounts-header-balances-spare-change').remove();
  }

  updateValue() {
    let selectedAccount = this.getSelectedAccount();
    if (selectedAccount) {
      let spareChange = selectedAccount.__ynabToolKitSpareChange;

      let spareChangeHeader = $('.ynab-toolkit-accounts-header-balances-spare-change');
      let spareChangeAmount = $('.user-data:not(.currency)', spareChangeHeader);
      let currencySpan = $('.user-data.currency', spareChangeHeader);

      currencySpan.removeClass('negative positive zero');

      if (spareChange < 0) {
        currencySpan.addClass('negative');
      } else if (spareChange > 0) {
        currencySpan.addClass('positive');
      } else {
        currencySpan.addClass('zero');
      }

      let formatted = ynabToolKit.shared.formatCurrency(spareChange);
      spareChangeAmount.attr('title', formatted.string);

      let formattedHtml = formatted.string.replace(/\$/g, '<bdi>$</bdi>');
      currencySpan.html(formattedHtml);
    }
  }

  onYnabGridyBodyChanged() {
    Ember.run.debounce(this, function () {
      this.setSelectedTransactions();
      this.updateSpareChangeCalculation();
      this.updateSpareChangeHeader();
    }, 250);
  }

  onYnabSelectionChanged(_this) {
    _this.selectedTransactions = undefined;
    _this.onYnabGridyBodyChanged();
  }
}
