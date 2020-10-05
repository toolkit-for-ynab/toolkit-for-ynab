import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { AutoReconcileContainer } from './components/AutoReconcileContainer';
import React from 'react';
import * as ReactDOM from 'react-dom';

const YNAB_RECONCILE_SELECTOR = '.accounts-header-reconcile';
const INDIVIDUAL_ACCOUNT_ROUTE = 'accounts.select';
const AUTO_RECONCILE_PARENT = '.accounts-header-actions';
const AUTO_RECONCILE_CONTAINER_ID = 'tk-auto-reconcile-container';

export class AutoReconcile extends Feature {
  shouldInvoke() {
    // Only if the ynab reconcile button is present, we should invoke.
    return $(YNAB_RECONCILE_SELECTOR).length > 0 && isCurrentRouteAccountsPage();
  }

  onRouteChanged(currentRoute) {
    // Unmount and hide the auto reconcile button
    const container = document.getElementById(AUTO_RECONCILE_CONTAINER_ID);
    if (container) {
      ReactDOM.unmountComponentAtNode(container);
    }

    if (!this.shouldInvoke()) return;

    // Render the container for auto reconcile
    if (currentRoute === INDIVIDUAL_ACCOUNT_ROUTE) {
      this.invoke();
    }
  }

  invoke() {
    setTimeout(() => {
      let container = document.getElementById(AUTO_RECONCILE_CONTAINER_ID);
      if (!container) {
        // Create the container for our React Button
        let autoReconcileContainer = document.createElement('span');
        autoReconcileContainer.setAttribute('id', AUTO_RECONCILE_CONTAINER_ID);

        // Append it as a child of the parent
        document.querySelector(AUTO_RECONCILE_PARENT).prepend(autoReconcileContainer);
      }

      // Render the react component as part of the container
      container = document.getElementById(AUTO_RECONCILE_CONTAINER_ID);
      if (container) {
        ReactDOM.render(React.createElement(AutoReconcileContainer), container);
      }
    }, 50);
  }
}
