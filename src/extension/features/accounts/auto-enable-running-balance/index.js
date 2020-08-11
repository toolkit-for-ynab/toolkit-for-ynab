import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup, serviceLookup } from 'toolkit/extension/utils/ember';

export class AutoEnableRunningBalance extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    const { selectedAccountId } = controllerLookup('accounts');
    const registerGridService = serviceLookup('register-grid');
    if (!registerGridService) {
      return;
    }

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
