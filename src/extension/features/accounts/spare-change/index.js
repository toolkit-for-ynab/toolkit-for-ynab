import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export class SpareChange extends Feature {
  selectedTransactions;

  currentlyRunning = false;

  applicationController = null;

  accountsController = null;

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  // invoke has potential of being pretty processing heavy (needing to sort content, then update calculation for every row)
  // wrapping it in a debounce means that if the user continuously scrolls down we won't clog up the event loop.
  invoke() {
    if (!this.shouldInvoke()) {
      return;
    }

    this.currentlyRunning = true;

    if (this.applicationController === null) {
      this.applicationController = controllerLookup('application');
    }

    if (this.accountsController === null) {
      this.accountsController = controllerLookup('accounts');
    }

    Ember.run.debounce(
      this,
      function() {
        this.accountsController.addObserver('areChecked', this, 'onYnabSelectionChanged');

        if (isCurrentRouteAccountsPage()) {
          if (this.applicationController.get('selectedAccountId')) {
            this.onYnabGridBodyChanged();
          } else {
            this.removeHeader();
          }
        }

        this.currentlyRunning = false;
      },
      250
    );
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
    let visibleTransactionDisplayItems = this.accountsController.get(
      'visibleTransactionDisplayItems'
    );
    this.selectedTransactions = visibleTransactionDisplayItems.filter(
      i => i.isChecked && i.get('outflow')
    );
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

  updateSpareChangeHeader() {
    if (this.selectedTransactions.length > 0) {
      this.insertHeader();
      this.updateValue();
    } else {
      this.removeHeader();
    }
  }

  insertHeader() {
    // remove existing
    $('.ynab-toolkit-accounts-header-balances-spare-change').remove();

    // build spare change div
    let spareChangeDiv = $('<div />').addClass(
      'ynab-toolkit-accounts-header-balances-spare-change'
    );
    let spareChangeAmount = $('<span />').addClass('user-data');
    let spareChangeTitle = $('<div />')
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

      let formatted = formatCurrency(spareChange);
      spareChangeAmount.attr('title', formatted);

      let formattedHtml = formatted.replace(/\$/g, '<bdi>$</bdi>');
      currencySpan.html(formattedHtml);
    }
  }

  onYnabGridBodyChanged() {
    Ember.run.debounce(
      this,
      function() {
        this.setSelectedTransactions();
        this.updateSpareChangeCalculation();
        this.updateSpareChangeHeader();
      },
      250
    );
  }

  onYnabSelectionChanged() {
    this.selectedTransactions = undefined;
    this.onYnabGridBodyChanged();
  }
}
