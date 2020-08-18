import * as React from 'react';
import { componentAppend } from 'toolkit/extension/utils/react';
import { HideMemosButton } from './components/hide-memos-button';
import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export class HideMemos extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  observe(changedNodes) {
    if (changedNodes.has('ynab-u modal-generic modal-account-view-menu modal-overlay')) {
      componentAppend(
        <HideMemosButton toggleHiddenState={this.setHiddenState} />,
        document.getElementsByClassName('modal-content')[0]
      );
    }
  }

  invoke() {
    const initialState = getToolkitStorageKey('hide-memos', false);
    this.setHiddenState(initialState);
  }

  setHiddenState = state => {
    setToolkitStorageKey('hide-memos', state);
    if (!state) {
      $('body').addClass('toolkit-hide-memos');
    } else {
      $('body').removeClass('toolkit-hide-memos');
    }
  };
}
