import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';

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
    applicationController.addObserver('budgetVersionId', function() {
      Ember.run.scheduleOnce('afterRender', this, function() {
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
        i => i.isChecked && i.get('accepted') === false
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

    $('body').on('keydown', function(e) {
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

  watchForRightClick() {
    var _this = this;

    // call approveTransactions if the notification 'i' icon is right clicked on
    Ember.run.next(function() {
      $('.ynab-grid').off(
        'contextmenu',
        '.ynab-grid-body-row .ynab-grid-cell-notification button.transaction-notification-info',
        function(event) {
          // prevent defaults
          event.preventDefault();
          event.stopPropagation();

          // select row
          $(this)
            .closest('.ynab-grid-body-row')
            .find('.ynab-grid-cell-checkbox button:not(.is-checked)')
            .click();

          // approve transactions
          _this.approveTransactions();
        }
      );
      $('.ynab-grid').on(
        'contextmenu',
        '.ynab-grid-body-row .ynab-grid-cell-notification button.transaction-notification-info',
        function(event) {
          // prevent defaults
          event.preventDefault();
          event.stopPropagation();

          // select row
          $(this)
            .closest('.ynab-grid-body-row')
            .find('.ynab-grid-cell-checkbox button:not(.is-checked)')
            .click();

          // approve transactions
          _this.approveTransactions();
        }
      );
    });

    // ensure that watchForRightClick() is only called once
    this.initClickLoop = false;
  }

  approveTransactions() {
    // call 'c' keypress clearing and approving transaction using built in YNAB functionality
    var keycode = jQuery.Event('keydown'); // eslint-disable-line new-cap
    keycode.which = 67;
    keycode.keyCode = 67;
    $('body').trigger(keycode);

    // call 'c' keypress again, to reset clear state back to previous
    // completely separate event is needed, otherwise event doesn't fire properly the second time
    var keycode2 = jQuery.Event('keydown'); // eslint-disable-line new-cap
    keycode2.which = 67;
    keycode2.keyCode = 67;
    $('body').trigger(keycode2);

    // unselect transactions after approval
    $('.ynab-grid-body-row.is-checked')
      .find('.ynab-grid-cell-checkbox button')
      .click();
  }
}
