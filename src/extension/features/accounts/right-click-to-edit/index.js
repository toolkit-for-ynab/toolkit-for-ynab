import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class RightClickToEdit extends Feature {
  isCurrentlyRunning = false;

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  // Supporting functions,
  // or variables, etc
  displayContextMenu(event) {
    let $element = $(this);
    // check for a right click on a split transaction
    if ($element.hasClass('ynab-grid-body-sub')) {
      // select parent transaction
      $element = $element.prevAll('.ynab-grid-body-parent:first');
    }

    if (!$element.hasClass('is-checked')) {
      // clear existing, then check current
      $('.ynab-checkbox-button.is-checked').click();
      $element.find('.ynab-checkbox-button').click();
    }

    // make context menu appear
    $('.accounts-toolbar-edit-transaction').click();

    // determine if modal needs to be positioned above or below clicked element
    let height = $('.modal-account-edit-transaction-list .modal').outerHeight();
    let below = (event.pageY + height) > $(window).height() ? false : true; // eslint-disable-line no-unneeded-ternary
    let offset = $element.offset(); // move context menu

    if (below) { // position below
      $('.modal-account-edit-transaction-list .modal')
        .addClass('modal-below')
        .css('left', event.pageX - 115)
        .css('top', offset.top + 41);
    } else { // position above
      $('.modal-account-edit-transaction-list .modal')
        .addClass('modal-above')
        .css('left', event.pageX - 115)
        .css('top', offset.top - height - 8);
    }

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
