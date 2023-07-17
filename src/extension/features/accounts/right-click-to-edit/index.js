import { Feature } from 'toolkit/extension/features/feature';
import { serviceLookup } from 'toolkit/extension/utils/ember';
import {
  getAccountsService,
  isCurrentRouteAccountsPage,
  ynabRequire,
} from 'toolkit/extension/utils/ynab';

const { next } = ynabRequire('@ember/runloop');

export class RightClickToEdit extends Feature {
  isCurrentlyRunning = false;

  injectCSS() {
    let css = require('./index.css');
    if (!ynabToolKit.options.ScrollableEditMenu) {
      css += `\n${require('../scrollable-edit-menu/index.css')}`;
    }

    return css;
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  displayContextMenu() {
    const $element = $(this);
    let $row = $element.parent();

    // check for a right click on a split transaction
    if ($row.hasClass('ynab-grid-body-sub')) {
      // select parent transaction
      $row = $row.prevAll('.ynab-grid-body-parent:first');
    }

    const accountsService = getAccountsService();
    const areChecked = accountsService.areChecked;
    const visibleTransactionDisplayItems =
      accountsService?.transactionEditorService?.visibleTransactionDisplayItems;

    const clickedTransactionId = $row.data().rowId;
    const clickedTransaction = visibleTransactionDisplayItems.find(
      ({ entityId }) => entityId === clickedTransactionId
    );

    if (!clickedTransaction.isChecked) {
      areChecked.setEach('isChecked', false);
      clickedTransaction.set('isChecked', true);
    }

    serviceLookup('modal').openModal('modals/account/edit-transactions', {
      controller: 'accounts',
      triggerElement: $(this),
    });

    return false;
  }

  hideContextMenu() {
    return false; // ignore right clicks
  }

  invoke() {
    if (!ynabToolKit.options.ScrollableEditMenu) {
      ynabToolKit.invokeFeature('ScrollableEditMenu', { force: true });
    }

    this.isCurrentlyRunning = true;

    next(this, function () {
      $('.ynab-grid').off('contextmenu', '.ynab-grid-body-row > div', this.displayContextMenu);
      $('.ynab-grid').on('contextmenu', '.ynab-grid-body-row > div', this.displayContextMenu);

      $('body').off('contextmenu', '.modal-account-edit-transaction-list', this.hideContextMenu);
      $('body').on('contextmenu', '.modal-account-edit-transaction-list', this.hideContextMenu);

      this.isCurrentlyRunning = false;
    });
  }

  destroy() {
    if (!ynabToolKit.options.ScrollableEditMenu) {
      ynabToolKit.destroyFeature('ScrollableEditMenu');
    }

    $('.ynab-grid').off('contextmenu', '.ynab-grid-body-row', this.displayContextMenu);
    $('body').off('contextmenu', '.modal-account-edit-transaction-list', this.hideContextMenu);
  }

  observe(changedNodes) {
    if (!this.shouldInvoke() || this.isCurrentlyRunning) return;

    if (changedNodes.has('ynab-grid-body')) {
      this.invoke();
    }
  }
}
