import { Feature } from 'toolkit/extension/features/feature';
import { componentLookup } from 'toolkit/extension/utils/ember';
import { getEntityManager } from 'toolkit/extension/utils/ynab';

export class EasyTransactionApproval extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    document.body.addEventListener('keydown', this.handleKeydown);

    for (const element of document.querySelectorAll('.ynab-grid-cell-notification button')) {
      element.addEventListener('contextmenu', this.approveTransaction);
    }

    this.addToolkitEmberHook('register/grid-row', 'didUpdate', this.attachEasyApproval);
  }

  destroy() {
    document.body.removeEventListener('keydown', this.handleKeydown);

    for (const element of document.querySelectorAll('.ynab-grid-cell-notification button')) {
      element.removeEventListener('contextmenu', this.approveTransaction);
    }
  }

  handleKeydown(event) {
    if (event.code === 'KeyA' || event.code === 'Enter') {
      const { transactionsCollection } = getEntityManager();
      getEntityManager().batchChangeProperties(() => {
        componentLookup('top-accounts').areChecked.forEach((transaction) => {
          const entity = transactionsCollection.findItemByEntityId(transaction.get('entityId'));
          if (entity) {
            entity.set('accepted', true);
          }
        });
      });
    }
  }

  attachEasyApproval(element) {
    element
      .querySelector('.ynab-grid-cell-notification button')
      ?.addEventListener('contextmenu', this.approveTransaction);
  }

  approveTransaction = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const rowId = event.currentTarget?.parentElement?.parentElement?.dataset?.rowId;
    if (rowId) {
      const { transactionsCollection } = getEntityManager();
      getEntityManager().batchChangeProperties(() => {
        const entity = transactionsCollection.findItemByEntityId(rowId);
        if (entity) {
          entity.set('accepted', true);
        }
      });
    }
  };
}
