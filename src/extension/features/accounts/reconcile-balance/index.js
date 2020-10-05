import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import * as ReactDOM from 'react-dom';
import { ReconcileBalanceComponent } from './ReconcileBalance';
import React from 'react';
const YNAB_ACCOUNTS_HEADER_BALANCES = '.accounts-header-balances';
const TK_RECONCILE_BALANCE_CONTAINER_ID = 'tk-accounts-header-reconcile-container';

export class ReconcileBalance extends Feature {
  injectCSS() {
    return require('./styles.css');
  }

  shouldInvoke() {
    let { selectedAccountId } = controllerLookup('accounts');
    return selectedAccountId && isCurrentRouteAccountsPage();
  }

  invoke() {
    let { selectedAccountId } = controllerLookup('accounts');

    // Find the parent div for the ynab accounts section
    let parentDiv = document.querySelector(YNAB_ACCOUNTS_HEADER_BALANCES);

    // Append a element to contain our component
    let container = document.getElementById(TK_RECONCILE_BALANCE_CONTAINER_ID);
    if (!container) {
      let reconcileBalanceContainer = document.createElement('span');
      reconcileBalanceContainer.setAttribute('id', TK_RECONCILE_BALANCE_CONTAINER_ID);
      parentDiv.prepend(reconcileBalanceContainer);
      container = reconcileBalanceContainer;
    }

    // Render the component at the container
    ReactDOM.render(<ReconcileBalanceComponent selectedAccountId={selectedAccountId} />, container);
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    } else {
      let container = document.getElementById(TK_RECONCILE_BALANCE_CONTAINER_ID);
      if (document.getElementById(TK_RECONCILE_BALANCE_CONTAINER_ID)) {
        ReactDOM.unmountComponentAtNode(container);
      }
    }
  }
}
