import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { AutoReconcileContainer } from './components/AutoReconcileContainer';
import React from 'react';
import * as ReactDOM from 'react-dom';

const YNAB_RECONCILE_SELECTOR = '.accounts-header-reconcile';
const YNAB_APPLICATION_BODY = '.ember-application';
const INDIVIDUAL_ACCOUNT_ROUTE = 'accounts.select';
const AUTO_RECONCILE_PARENT = '.accounts-header-actions';
const AUTO_RECONCILE_CONTAINER_ID = 'tk-auto-reconcile-container';
export const AUTO_RECONCILE_MODAL_PORTAL = 'tk-auto-reconcile-portal';

export class AutoReconcile extends Feature {
  shouldInvoke() {
    // Only if the ynab reconcile button is present, we should invoke.
    return $(YNAB_RECONCILE_SELECTOR).length > 0 && isCurrentRouteAccountsPage();
  }

  onRouteChanged(currentRoute) {
    // Note: Overlay prevents changing routes before closing modal
    // Unmount if the component if not on an indiviudal accounts tab
    if (!this.shouldInvoke()) {
      const container = document.getElementById(AUTO_RECONCILE_CONTAINER_ID);
      if (container) {
        ReactDOM.unmountComponentAtNode(container);
      }
      return;
    }

    // Render the container for auto reconcile
    if (currentRoute === INDIVIDUAL_ACCOUNT_ROUTE) {
      this.invoke();
    }
  }

  _createModalPortal() {
    let portal = document.getElementById(AUTO_RECONCILE_MODAL_PORTAL);
    if (!portal) {
      // Create the container for our React Button
      let portalDiv = document.createElement('div');
      portalDiv.setAttribute('id', AUTO_RECONCILE_MODAL_PORTAL);

      // Append it as a child of the parent
      document.querySelector(YNAB_APPLICATION_BODY).append(portalDiv);
    }
  }

  _createAutoReconcileContainer() {
    let container = document.getElementById(AUTO_RECONCILE_CONTAINER_ID);
    if (!container) {
      // Create the container for our React Button
      let autoReconcileContainer = document.createElement('span');
      autoReconcileContainer.setAttribute('class', 'tk-mg-r-1');
      autoReconcileContainer.setAttribute('id', AUTO_RECONCILE_CONTAINER_ID);

      // Append it as a child of the parent
      document.querySelector(AUTO_RECONCILE_PARENT).prepend(autoReconcileContainer);
    }
  }

  invoke() {
    setTimeout(() => {
      // Create the elements for the reconcile button and modal portal
      this._createAutoReconcileContainer();
      this._createModalPortal();

      // Render the react component as part of the container
      let container = document.getElementById(AUTO_RECONCILE_CONTAINER_ID);
      if (container) {
        ReactDOM.render(React.createElement(AutoReconcileContainer), container);
      }
    }, 50);
  }
}
