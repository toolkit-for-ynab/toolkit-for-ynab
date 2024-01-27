import { getModalService } from 'toolkit/extension/utils/ynab';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';

export function showTransactionModal(title: string, transactions: YNABTransaction[]) {
  const modalService = getModalService();
  // glitch: clicking on a transaction may not correctly navigate
  // depending on the currently active route
  modalService?.setDataForModal?.({
    modalTitle: title,
    modalTransactions: transactions,
  });
  modalService?.openModal?.('modals/reports/transactions');
}
