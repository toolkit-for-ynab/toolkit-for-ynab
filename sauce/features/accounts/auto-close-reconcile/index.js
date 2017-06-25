import { Feature } from 'core/feature';
import * as toolkitHelper from 'helpers/toolkit';

export class AutoCloseReconcile extends Feature {
  observe(changedNodes) {
    const hasClickedYesModal = changedNodes.has('modal-account-reconcile-current') &&
                               changedNodes.has('flaticon stroke checkmark-2');

    // if you click no on the reconcile modal, you get to enter a transaction
    // which can later be clicked to auto-adjust your balance. we'll call this
    // "deferredReconcile" in the case of a deferredReconcile, YNAB has to do
    // some additional work as well, so we make the timeout longer because it will
    // most definitely take longer for the modal to render
    const hasDeferredReconcile = changedNodes.has('accounts-header-reconcile ember-view button active');
    if (hasClickedYesModal || hasDeferredReconcile) {
      if ($('.modal-account-reconcile-reconciled').length) {
        Ember.run.later(() => {
          const applicationController = toolkitHelper.controllerLookup('application');
          applicationController.send('closeModal');
        }, hasDeferredReconcile ? 3000 : 1500);
      }
    }
  }
}
