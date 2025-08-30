import * as React from 'react';
import { componentAfter } from 'toolkit/extension/utils/react';
import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { HideClosedButton } from './HideClosedButton';
import { serviceLookup } from 'toolkit/extension/utils/ember';
import { YNABModalService } from 'toolkit/types/ynab/services/YNABModalService';

export class HideClosedAccounts extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    const initialState = getToolkitStorageKey('hide-closed', true);
    this.setHiddenState(initialState);
    const modalElement = document.querySelector('.ynab-new-settings-menu');
    if (modalElement) {
      this.insertHideClosed(modalElement);
    }
  }

  destroy() {
    $('#tk-hide-closed-accounts').remove();
    $('body').removeClass('tk-hide-closed');
  }

  observe(changedNodes: Set<string>) {
    if (changedNodes.has('ynab-new-settings-menu')) {
      this.invoke();
    }
  }

  insertHideClosed(element: Element) {
    if ($('#tk-hide-closed-accounts').length === 0) {
      componentAfter(
        <HideClosedButton toggleHiddenState={this.setHiddenState} />,
        element.getElementsByClassName('modal-select-import-from')[0],
      );
    }
  }

  setHiddenState = (state: boolean) => {
    setToolkitStorageKey('hide-closed', state);
    if (state) {
      $('body').addClass('tk-hide-closed');
    } else {
      $('body').removeClass('tk-hide-closed');
    }
  };
}
