import { getModalService } from 'toolkit/extension/utils/ynab';

export function showTransactionModal(title, transactions) {
  const modalService = getModalService();
  // glitch: clicking on a transaction may not correctly navigate
  // depending on the currently active route
  modalService.setDataForModal({
    modalTitle: title,
    modalTransactions: transactions,
  });
  modalService.openModal('modals/reports/transactions');
}
