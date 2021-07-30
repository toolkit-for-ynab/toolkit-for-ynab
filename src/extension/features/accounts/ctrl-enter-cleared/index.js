import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class CtrlEnterCleared extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage() && $('.ynab-grid-body-row.is-editing').length;
  }

  invoke() {
    const editRows = $('.ynab-grid-body-row.is-editing');
    const editInputs = $(
      '.ynab-grid-cell-memo input, .ynab-grid-cell-outflow input, .ynab-grid-cell-inflow input',
      editRows
    );
    editInputs.each((index, input) => {
      if (!input.getAttribute('data-toolkit-ctrl-behavior')) {
        input.setAttribute('data-toolkit-ctrl-behavior', true);
        input.addEventListener('keydown', this.applyCtrlEnter);
      }
    });
  }

  applyCtrlEnter(event) {
    if (event.keyCode === 13 && (event.metaKey || event.ctrlKey)) {
      let markClearedButton = document.querySelector('.is-editing .ynab-cleared:not(.is-cleared)');
      if (markClearedButton) {
        markClearedButton.click();
      }
    }
  }

  observe(changedNodes) {
    if (!changedNodes.has('ynab-grid-body')) return;

    if (this.shouldInvoke()) {
      this.invoke();
    }
  }
}
