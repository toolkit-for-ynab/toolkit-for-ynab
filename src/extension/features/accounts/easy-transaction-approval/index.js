import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { l10n } from 'toolkit/extension/utils/toolkit';

export class EasyTransactionApproval extends Feature {
  initBudgetVersion = true;

  initKeyLoop = true;

  initClickLoop = true;

  watchForKeys = false;

  selectedTransactions = undefined;

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    // watch for the user potentially changing the budget
    if (this.initBudgetVersion) {
      this.addBudgetVersionIdObserver();
    }

    // watch for switch to Accounts section or selection change
    if (
      changedNodes.has('ynab-grid-body') ||
      changedNodes.has('ynab-checkbox-button is-checked') ||
      changedNodes.has('ynab-checkbox-button ')
    ) {
      this.invoke();
    }

    // disable keydown watch on creation or editing of transactions
    if (changedNodes.has('accounts-toolbar-edit-transaction button button-disabled')) {
      this.watchForKeys = false;
    }
  }

  addBudgetVersionIdObserver() {
    var _this = this;

    var applicationController = controllerLookup('application');
    applicationController.addObserver('budgetVersionId', function () {
      Ember.run.scheduleOnce('afterRender', this, function () {
        _this.initKeyLoop = true;
        _this.initClickLoop = true;
      });
    });
  }

  invoke() {
    // get selected transactions
    this.selectedTransactions = null;
    const accountController = controllerLookup('accounts');
    if (!accountController) {
      return;
    }

    const visibleTransactionDisplayItems = accountController.get('visibleTransactionDisplayItems');
    if (visibleTransactionDisplayItems) {
      this.selectedTransactions = visibleTransactionDisplayItems.filter(
        (i) => i.isChecked && i.get('accepted') === false
      );
    }

    // only watch for keydown if there are selected, unaccepted transactions
    if (this.selectedTransactions && this.selectedTransactions.length > 0) {
      this.watchForKeys = true;
    }

    // call watchForKeyInput() once
    if (this.initKeyLoop) {
      this.watchForKeyInput();
    }

    // call watchForRightClick() once
    if (this.initClickLoop) {
      this.watchForRightClick();
    }
  }

  watchForKeyInput() {
    var _this = this;

    $('body').on('keydown', function (e) {
      if ((e.which === 13 || e.which === 65) && _this.watchForKeys) {
        // approve selected transactions when 'a' or 'enter is pressed'
        _this.approveTransactions();

        // disable keydown watch until selection is changed again
        _this.watchForKeys = false;
      }
    });

    // ensure that watchForKeyInput() is only called once
    this.initKeyLoop = false;
  }

  clickCallback(event) {
    // prevent defaults
    event.preventDefault();
    event.stopPropagation();

    const selectedRows = $('.ynab-grid-body-row .ynab-grid-cell-checkbox button.is-checked');

    const checkbox = $(this).closest('.ynab-grid-body-row').find('.ynab-grid-cell-checkbox button');
    const isChecked = checkbox.hasClass('is-checked');

    // if the row clicked isn't already selected, select only that row for approval
    if (!isChecked) {
      selectedRows.click();
      checkbox.click();
    }

    // approve transactions
    event.data();

    // restore original selection
    if (!isChecked) {
      selectedRows.click();
      checkbox.click();
    }
  }

  watchForRightClick() {
    var _this = this;

    // call approveTransactions if the notification 'i' icon is right clicked on
    Ember.run.next(function () {
      $('.ynab-grid').off(
        'contextmenu',
        '.ynab-grid-body-row .ynab-grid-cell-notification button.transaction-notification-info',
        _this.clickCallback
      );
      $('.ynab-grid').on(
        'contextmenu',
        '.ynab-grid-body-row .ynab-grid-cell-notification button.transaction-notification-info',
        _this.approveTransactions,
        _this.clickCallback
      );
    });

    // ensure that watchForRightClick() is only called once
    this.initClickLoop = false;
  }

  approveTransactions() {
    // open the edit menu
    $('.accounts-toolbar-edit-transaction').click();

    // attempt to find and click the approve button
    $('.modal-account-edit-transaction-list .button-list')
      .filter(
        (index, el) =>
          el.textContent && el.textContent.trim() === l10n('accounts.approve', 'Approve')
      )
      .click();

    // if the edit menu is still open, close it
    if ($('.modal-account-edit-transaction-list').length) {
      $('.modal-account-edit-transaction-list').click();
    }
  }
}
