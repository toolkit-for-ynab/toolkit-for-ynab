import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class SplitTransactionAutoAdjust extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage() && $('.ynab-grid-split-add-sub-transaction').length !== 0;
  }

  invoke() {
    let outflows = $('.is-editing .ynab-grid-cell-outflow .ember-text-field').toArray();
    let inflows = $('.is-editing .ynab-grid-cell-inflow .ember-text-field').toArray();

    let remaining = ynab.unformat(inflows[0].value) - ynab.unformat(outflows[0].value);

    for (let i = 1; i < outflows.length; i++) {
      remaining -= ynab.unformat(inflows[i].value);
      remaining += ynab.unformat(outflows[i].value);
    }

    if (remaining) {
      for (let i = 1; i < outflows.length; i++) {
        if (outflows[i].value === '' && inflows[i].value === '') {
          if (remaining < 0) {
            $(outflows[i]).val(ynab.formatCurrency(-remaining * 1000));
            $(outflows[i]).trigger('change');
            $(outflows[i]).trigger('blur');
          } else if (remaining > 0) {
            $(inflows[i]).val(ynab.formatCurrency(remaining * 1000));
            $(inflows[i]).trigger('change');
            $(inflows[i]).trigger('blur');
          }
          break;
        }
      }
    }
  }

  observe() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
