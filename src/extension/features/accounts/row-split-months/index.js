import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage, getRegisterGridService } from 'toolkit/extension/utils/ynab';

export class RowSplitMonths extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  injectCSS() {
    let css = require('./index.css');
    return css;
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('ynab-grid-body')) {
      this.invoke();
    }
  }

  invoke() {
    const allRows = $('.ynab-grid-body-row');

    allRows.each((ix, element) => {
      const nextRow = allRows.eq(ix + 1)?.[0];

      if (!nextRow) {
        return;
      }

      const transaction = getRegisterGridService().visibleTransactionDisplayItems.find(
        ({ entityId }) => {
          return entityId === element.dataset.rowId;
        }
      );
      const nextTransaction = getRegisterGridService().visibleTransactionDisplayItems.find(
        ({ entityId }) => {
          return entityId === nextRow.dataset.rowId;
        }
      );

      if (!transaction || !nextTransaction) {
        return;
      }

      if (transaction.month !== nextTransaction.month) {
        element.classList.add('tk-rsm-last');
      }
    });
  }
}
