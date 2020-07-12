import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class CtrlEnterCleared extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage() && $('.ynab-grid-body-row.is-adding').length;
  }

  invoke() {
    const addRow = document.querySelector('.ynab-grid-body-row.is-adding');
    const memoInput = addRow.querySelector('.ynab-grid-cell-memo input');
    const outflowInput = addRow.querySelector('.ynab-grid-cell-outflow input');
    const inflowInput = addRow.querySelector('.ynab-grid-cell-inflow input');

    if (!memoInput.getAttribute('data-toolkit-ctrl-behavior')) {
      memoInput.setAttribute('data-toolkit-ctrl-behavior', true);
      memoInput.addEventListener('keydown', this.applyCtrlEnter);
    }

    if (!outflowInput.getAttribute('data-toolkit-ctrl-behavior')) {
      outflowInput.setAttribute('data-toolkit-ctrl-behavior', true);
      outflowInput.addEventListener('keydown', this.applyCtrlEnter);
    }

    if (!inflowInput.getAttribute('data-toolkit-ctrl-behavior')) {
      inflowInput.setAttribute('data-toolkit-ctrl-behavior', true);
      inflowInput.addEventListener('keydown', this.applyCtrlEnter);
    }
  }

  applyCtrlEnter(event) {
    if (event.keyCode === 13 && (event.metaKey || event.ctrlKey)) {
      let markClearedButton = document.querySelector('.is-adding .ynab-cleared:not(.is-cleared)');
      if (markClearedButton) {
        markClearedButton.click();
      }
    }
  }

  observe(changedNodes) {
    if (!changedNodes.has('ynab-grid-add-rows')) return;

    if (this.shouldInvoke()) {
      this.invoke();
    }
  }
}
