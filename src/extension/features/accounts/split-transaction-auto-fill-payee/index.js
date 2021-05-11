import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class SplitTransactionAutoFillPayee extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage() && $('.ynab-grid-split-add-sub-transaction').length !== 0;
  }

  invoke() {
    const cells = $('.is-editing .ynab-grid-cell-payeeName .ember-text-field').toArray();
    cells.forEach((cell, i) => {
      if (i !== 0 && cell.value === '') {
        $(cell).val(cells[0].value);
        $(cell).trigger('change');
        $(cell).trigger('blur');
      }
    });
  }

  observe() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
