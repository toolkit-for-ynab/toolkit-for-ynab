import * as React from 'react';
import { componentAppend } from 'toolkit/extension/utils/react';
import { HideHelpButton } from './components/hide-help-button';
import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export class HideHelp extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  observe(changedNodes) {
    if (changedNodes.has('ynab-u modal-popup modal-sidebar-menu ember-view modal-overlay active')) {
      componentAppend(
        <HideHelpButton toggleHiddenState={this.setHiddenState} />,
        document.getElementsByClassName('modal-list')[0]
      );
    }
  }

  invoke() {
    const initialState = getToolkitStorageKey('hide-help', true);
    this.setHiddenState(initialState);
  }

  setHiddenState = state => {
    setToolkitStorageKey('hide-help', state);
    if (state) {
      $('body').addClass('toolkit-hide-help');
    } else {
      $('body').removeClass('toolkit-hide-help');
    }
  };
}
