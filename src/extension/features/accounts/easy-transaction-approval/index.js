import { Feature } from 'toolkit/extension/features/feature';
import { containerLookup } from 'toolkit/extension/utils/ember';
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
      const isInputEvent = event.target.nodeName === 'INPUT';

      if (isInputEvent) return;

      getEntityManager().batchChangeProperties(() => {
        containerLookup('service:accounts').areChecked.forEach((transaction) => {
          const entity = getEntityManager().getTransactionById(transaction?.entityId);
          if (entity) {
            entity.accepted = true;
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
      getEntityManager().batchChangeProperties(() => {
        const entity = getEntityManager().getTransactionById(rowId);
        if (entity) {
          entity.accepted = true;
        }
      });
    }
  };
}
