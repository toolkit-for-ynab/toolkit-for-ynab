import * as React from 'react';
import { componentAppend } from 'toolkit/extension/utils/react';
import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { HideHelpButton } from './HideHelpButton';
import { serviceLookup } from 'toolkit/extension/utils/ember';
import { YNABModalService } from 'toolkit/types/ynab/services/YNABModalService';

export class HideHelp extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  insertHideHelp(element: Element) {
    if ($('#tk-hide-help', element).length) {
      return;
    }

    componentAppend(
      <HideHelpButton toggleHiddenState={this.setHiddenState} />,
      element.getElementsByClassName('modal-list')[0]
    );
  }

  invoke() {
    const initialState = getToolkitStorageKey('hide-help', true);
    this.setHiddenState(initialState);
    const modalElement = document.querySelector('.ynab-new-settings-menu');
    if (modalElement) this.insertHideHelp(modalElement);
  }

  destroy() {
    $('#tk-hide-help').remove();
    $('body').removeClass('toolkit-hide-help');
  }

  observe(nodes: Set<string>) {
    if (nodes.has('modal-overlay active  ynab-u ynab-new-settings-menu')) {
      this.invoke();
    }
  }

  setHiddenState = (state: boolean) => {
    setToolkitStorageKey('hide-help', state);
    if (state) {
      $('body').addClass('toolkit-hide-help');
    } else {
      $('body').removeClass('toolkit-hide-help');
    }
  };
}
