import { Feature } from 'toolkit/extension/features/feature';
import { controllerLookup, serviceLookup } from 'toolkit/extension/utils/ember';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class RightClickToEdit extends Feature {
  isCurrentlyRunning = false;

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  displayContextMenu() {
    let $element = $(this);
    // check for a right click on a split transaction
    if ($element.hasClass('ynab-grid-body-sub')) {
      // select parent transaction
      $element = $element.prevAll('.ynab-grid-body-parent:first');
    }

    const { areChecked, visibleTransactionDisplayItems } = controllerLookup('accounts');
    const clickedTransactionId = $element.data().rowId;
    const clickedTransaction = visibleTransactionDisplayItems.find(
      ({ entityId }) => entityId === clickedTransactionId
    );

    if (!clickedTransaction.isChecked) {
      areChecked.setEach('isChecked', false);
      clickedTransaction.set('isChecked', true);
    }

    serviceLookup('modal').openModal('modals/account/edit-transactions', {
      controller: 'accounts',
      triggerElement: $element,
    });

    return false;
  }

  hideContextMenu() {
    return false; // ignore right clicks
  }

  invoke() {
    this.isCurrentlyRunning = true;

    Ember.run.next(this, function () {
      $('.ynab-grid').off('contextmenu', '.ynab-grid-body-row', this.displayContextMenu);
      $('.ynab-grid').on('contextmenu', '.ynab-grid-body-row', this.displayContextMenu);

      $('body').off('contextmenu', '.modal-account-edit-transaction-list', this.hideContextMenu);
      $('body').on('contextmenu', '.modal-account-edit-transaction-list', this.hideContextMenu);

      this.isCurrentlyRunning = false;
    });
  }

  observe(changedNodes) {
    if (!this.shouldInvoke() || this.isCurrentlyRunning) return;

    if (changedNodes.has('ynab-grid-body')) {
      this.invoke();
    }
  }
}
