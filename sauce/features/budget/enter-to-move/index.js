import { Feature } from 'toolkit/core/feature';
import * as toolkitHelper from 'toolkit/helpers/toolkit';

const MOVE_POPUP =
  'ynab-u modal-popup modal-budget modal-budget-move-money ember-view modal-overlay active';
const CATEGORY_DROPDOWN = 'dropdown-container categories-dropdown-container';
const BUTTON_PRIMARY = 'button button-primary ';

export class EnterToMove extends Feature {
  modalIsOpen = false;

  constructor() {
    super();
    this.onKeyDownHandler = this.onKeyDown.bind(this);
  }

  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('budget') !== -1;
  }

  invoke() {}

  onKeyDown(e) {
    const keycode = e.keycode || e.which;
    if (keycode === 13) {
      const OK = $(
        '.modal-budget-move-money .modal-actions button:first-child'
      );
      OK.click();
      document.removeEventListener('keydown', this.onKeyDownHandler, false);
    }
  }

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
      document.addEventListener('keydown', this.onKeyDownHandler, false);
    }
  }
}
