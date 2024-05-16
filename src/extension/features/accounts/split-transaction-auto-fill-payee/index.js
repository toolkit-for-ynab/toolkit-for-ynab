import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class SplitTransactionAutoFillPayee extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage() && $('.ynab-grid-split-add-sub-transaction').length !== 0;
  }

  invoke() {
    const cells = document.querySelectorAll(
      '.is-editing .ynab-grid-cell-payeeName .ember-text-field'
    );

    cells.forEach((cell, i) => {
      if (i !== 0 && !cell.dataset.tkAutoFilledPayee && !cell.value) {
        cell.dataset.tkAutoFilledPayee = true;
        cell.value = cells[0].value;
        cell.dispatchEvent(new Event('input'));
        cell.dispatchEvent(new Event('change'));
        cell.dispatchEvent(new Event('blur'));
      }
    });
  }

  observe() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
