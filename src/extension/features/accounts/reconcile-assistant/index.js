import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { ReconcileAssistantContainer } from './components/ReconcileAssistantContainer';
import React from 'react';
import * as ReactDOM from 'react-dom';

const YNAB_RECONCILE_BUTTON = '.accounts-header-reconcile';
const YNAB_APPLICATION_BODY = '.ember-application';
export const YNAB_ADJUSTMENT_SELECTOR = '.accounts-adjustment.account-flash-notification';
export const YNAB_RECONCILE_INPUT_MODAL = '.modal-account-reconcile-enter-balance';
export const RECONCILE_ASSISTANT_CONTAINER_ID = 'tk-reconcile-assistant-container';
export const RECONCILE_ASSISTANT_MODAL_PORTAL = 'tk-reconcile-assistant-portal';

export class ReconcileAssistant extends Feature {
  _reconcileInputValue = '0';

  shouldInvoke() {
    return $(YNAB_RECONCILE_BUTTON).length > 0 && isCurrentRouteAccountsPage();
  }

  observe(changedNodes) {
    if (changedNodes.has('modal-account-reconcile-enter-balance')) {
      this._attachInputListener();
    } else if (changedNodes.has('accounts-adjustment-label user-data')) {
      this.invoke();
    }
  }

  invoke() {
    if (!this.shouldInvoke()) {
      return;
    }

    setTimeout(() => {
      // Create the elements for the clear assistance button and modal portal
      this._createFeatureContainer();
      this._createModalPortal();

      // Render the react component as part of the container
      let container = document.getElementById(RECONCILE_ASSISTANT_CONTAINER_ID);
      if (container) {
        ReactDOM.render(
          <ReconcileAssistantContainer
            reconcileInputValue={this._reconcileInputValue}
            portalId={RECONCILE_ASSISTANT_MODAL_PORTAL}
          />,
          container
        );
      }
    }, 50);
  }

  destroy() {
    $(`#${RECONCILE_ASSISTANT_CONTAINER_ID}`).remove();
    $(`#${RECONCILE_ASSISTANT_MODAL_PORTAL}`).remove();
  }

  /**
   * Attach an input listener to the reconcile input field
   * Set our reconcile value on input change to be used
   * @returns {void}
   */
  _attachInputListener() {
    let inputElement = $(YNAB_RECONCILE_INPUT_MODAL).find('input');
    if (inputElement.length) {
      inputElement.on('input', (e) => {
        this._reconcileInputValue = e.target.value;
      });
    }
  }

  /**
   * Create the react modal portal in the DOM if its not already present
   */
  _createModalPortal() {
    let portal = $(`#${RECONCILE_ASSISTANT_MODAL_PORTAL}`);
    if (!portal.length) {
      // Append it as a child of the ynab application
      let ynabApp = $(YNAB_APPLICATION_BODY);
      if (ynabApp.length) {
        ynabApp.append(`<div id='${RECONCILE_ASSISTANT_MODAL_PORTAL}'></div>`);
      }
    }
  }

  /**
   * Create the feature container in the DOM if its not already present
   */
  _createFeatureContainer() {
    let container = $(`#${RECONCILE_ASSISTANT_CONTAINER_ID}`);
    if (!container.length) {
      // Append the container next to the create adjustment button
      let parent = $(YNAB_ADJUSTMENT_SELECTOR);

      if (parent) {
        parent.append(`<span class='tk-mg-r-1' id='${RECONCILE_ASSISTANT_CONTAINER_ID}'></span>`);
      }
    }
  }
}
