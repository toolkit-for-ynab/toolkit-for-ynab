import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';

export class AutoEnableRunningBalance extends Feature {
  shouldInvoke() {
    return YNABFEATURES['view-menu'] && isCurrentRouteAccountsPage();
  }

  invoke() {
    const registerService = controllerLookup('accounts').get('registerGridService');
    const { balance } = registerService.get('displayColumns');
    if (!balance) {
      try {
        // misspelled -- should remove once/if fixed
        registerService.toggleVieMenuColumn('balance');
        return;
      } catch {
        /* ignore */
      }

      try {
        registerService.toggleViewMenuColumn('balance');
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
