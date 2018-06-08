import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

const MOVE_POPUP =
  'ynab-u modal-popup modal-budget modal-budget-move-money ember-view modal-overlay active';
const CATEGORY_DROPDOWN = 'dropdown-container categories-dropdown-container';
const BUTTON_PRIMARY = 'button button-primary ';
const BUTTON_CANCEL = 'button button-cancel';
const MODAL_CONTENT = 'modal-content';

export class EnterToMove extends Feature {
  modalIsOpen = false;

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {}

  onKeyDown = e => {
    const keycode = e.keycode || e.which;
    if (keycode === 13) {
      const OK = $('.modal-budget-move-money .modal-actions button:first-child');
      OK.click();
    }
  };

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has(MOVE_POPUP)) {
      this.modalIsOpen = true;
    }

    if (
      this.modalIsOpen &&
      changedNodes.has(CATEGORY_DROPDOWN) &&
      changedNodes.has(BUTTON_PRIMARY)
    ) {
      // Ready to click button
      document.addEventListener('keydown', this.onKeyDown, false);
    }

    if (
      this.modalIsOpen &&
      changedNodes.has(BUTTON_PRIMARY) &&
      changedNodes.has(BUTTON_CANCEL) &&
      changedNodes.has(MODAL_CONTENT)
    ) {
      // Modal has closed
      this.modalIsOpen = false;
      document.removeEventListener('keydown', this.onKeyDown, false);
    }
  }
}
