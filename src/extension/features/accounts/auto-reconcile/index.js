import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { AutoReconcileContainer } from './components/AutoReconcileContainer';
import React from 'react';
import * as ReactDOM from 'react-dom';

const YNAB_RECONCILE_SELECTOR = '.accounts-header-reconcile';
const YNAB_APPLICATION_BODY = '.ember-application';
const AUTO_RECONCILE_CONTAINER_ID = 'tk-auto-reconcile-container';
export const YNAB_RECONCILE_INPUT_MODAL = '.modal-account-reconcile-enter-balance';
export const AUTO_RECONCILE_MODAL_PORTAL = 'tk-auto-reconcile-portal';

export class AutoReconcile extends Feature {
  shouldInvoke() {
    // Only if the ynab reconcile button is present, we should invoke.
    return $(YNAB_RECONCILE_SELECTOR).length > 0 && isCurrentRouteAccountsPage();
  }

  observe(changedNodes) {
    if (changedNodes.has('modal-account-reconcile-enter-balance')) {
      this.invoke();
    }
  }

  _createModalPortal() {
    let portal = document.getElementById(AUTO_RECONCILE_MODAL_PORTAL);
    if (!portal) {
      // Create the container for our React Modal
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

      // Append the button next to the ok button
      let parent = document.querySelector(YNAB_RECONCILE_INPUT_MODAL);
      if (parent) {
        let okButton = parent.getElementsByTagName('button')[0];
        okButton.textContent = 'Reconcile';
        parent.insertBefore(autoReconcileContainer, okButton);
      }
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
