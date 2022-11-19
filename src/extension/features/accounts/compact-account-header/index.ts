import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { Feature } from '../../feature';

export class CompactAccountHeader extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  observe(changedNodes: Set<string>) {
    if (!changedNodes.has('ynab-grid-body')) {
      return;
    }

    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    let $reconcileTimeframe = $('.account-info-small-text > small[title]');
    let $accountBalances = $('.accounts-header-balances');
    let $accountHeaderFirstChild = $('.accounts-header-top > div:nth-child(1)');
    let $largeEditButton = $('.accounts-header-edit-account');

    $largeEditButton.remove();
    $accountHeaderFirstChild.after($accountBalances);
    $reconcileTimeframe.addClass('accounts-header-label');
    $('.reconcile-button-and-label').append($reconcileTimeframe);
  }
}
