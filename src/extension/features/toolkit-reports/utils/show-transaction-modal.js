import { controllerLookup } from 'toolkit/extension/utils/ember';

export function showTransactionModal(title, transactions) {
  const applicationController = controllerLookup('application');
  const reportsController = controllerLookup('reports/spending');
  reportsController.set('modalTitle', title);
  reportsController.set('modalTransactions', transactions);
  applicationController.send('openModal', 'modals/reports/transactions', {
    controller: reportsController,
  });
}
