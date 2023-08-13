import * as React from 'react';
import { Feature } from 'toolkit/extension/features/feature';
import { componentAfter } from 'toolkit/extension/utils/react';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { ToggleSplitButton } from './components/toggle-split-button';

export class ToggleSplits extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    if (document.querySelector('.tk-toggle-splits')) {
      return;
    }

    componentAfter(
      <ToggleSplitButton />,
      document.querySelector('.js-accounts-toolbar-file-import-transactions')
    );
  }

  destroy() {
    $('.tk-toggle-splits').remove();
    $('.accounts-toolbar-left').removeClass('tk-accounts-toolbar-left');
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }
}
