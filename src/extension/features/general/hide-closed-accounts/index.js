import * as React from 'react';
import { componentAppend } from 'toolkit/extension/utils/react';
import { HideClosedButton } from './components/hide-closed-button';
import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export class HideClosedAccounts extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  observe(changedNodes) {
    if (changedNodes.has('ynab-u ynab-new-settings-menu modal-overlay active')) {
      componentAppend(
        <HideClosedButton toggleHiddenState={this.setHiddenState} />,
        document.getElementsByClassName('modal-list')[0]
      );
    }
  }

  invoke() {
    const initialState = getToolkitStorageKey('hide-closed', true);
    this.setHiddenState(initialState);
  }

  setHiddenState = state => {
    setToolkitStorageKey('hide-closed', state);
    if (state) {
      $('body').addClass('toolkit-hide-closed');
    } else {
      $('body').removeClass('toolkit-hide-closed');
    }
  };
}
