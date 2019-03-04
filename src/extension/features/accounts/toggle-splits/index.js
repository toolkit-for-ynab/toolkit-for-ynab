import * as React from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import { componentAfter } from 'toolkit/extension/utils/react';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { ToggleSplitButton } from './components/toggle-split-button';

export class ToggleSplits extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    if (document.querySelector('.tk-toggle-splits')) {
      return;
    }

    componentAfter(<ToggleSplitButton />, $('.accounts-toolbar .undo-redo-container')[0]);

    $('.accounts-toolbar-left').addClass('toolkit-accounts-toolbar-left');
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }
}
