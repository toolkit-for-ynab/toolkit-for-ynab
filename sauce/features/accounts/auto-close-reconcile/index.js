import { Feature } from 'core/feature';
import * as toolkitHelper from 'helpers/toolkit';

export class AutoCloseReconcile extends Feature {
  observe(changedNodes) {
    if (
      changedNodes.has('modal-account-reconcile-current') &&
      changedNodes.has('flaticon stroke checkmark-2')
    ) {
      Ember.run.later(() => {
        const applicationController = toolkitHelper.controllerLookup('application');
        applicationController.send('closeModal');
      }, 1500);
    }
  }
}
