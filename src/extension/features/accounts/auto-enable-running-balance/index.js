import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';

export class AutoEnableRunningBalance extends Feature {
  shouldInvoke() {
    return YNABFEATURES['view-menu'] && isCurrentRouteAccountsPage();
  }

  invoke() {
    const accountsController = controllerLookup('accounts');
    const { registerGridService, selectedAccountId } = accountsController.getProperties(
      'registerGridService',
      'selectedAccountId'
    );

    const { balance } = registerGridService.get('displayColumns');
    if (selectedAccountId && !balance) {
      try {
        // misspelled -- should remove once/if fixed
        registerGridService.toggleVieMenuColumn('balance');
        return;
      } catch {
        /* ignore */
      }

      try {
        registerGridService.toggleViewMenuColumn('balance');
      } catch {
        /* ignore */
      }
    }
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }
}
