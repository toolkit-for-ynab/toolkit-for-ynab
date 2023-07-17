import { controllerLookup } from 'toolkit/extension/utils/ember';
import { getModalService } from 'toolkit/extension/utils/ynab';

export function showTransactionModal(title, transactions) {
  const reportsController = controllerLookup('reports/spending');
  reportsController.set('modalTitle', title);
  reportsController.set('modalTransactions', transactions);
  getModalService().openModal('modals/reports/transactions', {
    controller: reportsController,
  });
}
