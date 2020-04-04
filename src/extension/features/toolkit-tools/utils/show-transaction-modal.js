import { controllerLookup } from 'toolkit/extension/utils/ember';

export function showTransactionModal(title, transactions) {
  const applicationController = controllerLookup('application');
  const toolsController = controllerLookup('tools/spending');
  toolsController.set('modalTitle', title);
  toolsController.set('modalTransactions', transactions);
  applicationController.send('openModal', 'modals/reports/transactions', {
    controller: toolsController,
  });
}
