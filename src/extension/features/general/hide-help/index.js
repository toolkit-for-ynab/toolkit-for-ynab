import { Feature } from 'toolkit/extension/features/feature';
import { l10n, getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { controllerLookup } from 'toolkit/extension/utils/ember';

export class HideHelp extends Feature {
  injectCSS() { return require('./index.css'); }

  shouldInvoke() { return true; }

  observe(changedNodes) {
    if (changedNodes.has('ynab-u modal-popup modal-user-prefs ember-view modal-overlay active')) {
      this.updatePopupButton();
    }
  }

  invoke() {
    const initialState = getToolkitStorageKey('hide-help', true);
    this.setHiddenState(initialState);
  }

  setHiddenState = (state) => {
    setToolkitStorageKey('hide-help', state);
    if (state) {
      $('body').addClass('toolkit-hide-help');
    } else {
      $('body').removeClass('toolkit-hide-help');
    }
  }

  updatePopupButton() {
    const isHidden = getToolkitStorageKey('hide-help', true);
    const $modal = $('.modal-user-prefs .modal');
    const $modalList = $('.modal-user-prefs .modal-list');

    if ($('.ynab-toolkit-hide-help', $modalList).length) return;

    // it's possible the beacon doesn't actually match the state we think it should so don't
    // set the label based on what we have in local storage so we should always use the source
    // of truth when toggling. We'll use local storage to get the initial state.
    const label = isHidden ? l10n('app.show', 'Show') : l10n('app.hide', 'Hide');

    $(`<li class="ynab-toolkit-hide-help">
      <button>
        <i class="flaticon stroke help-2"></i>
        ` + label + ` Help Button
      </button>
     </li>
    `).click(() => {
      this.setHiddenState(!isHidden);
      controllerLookup('accounts').send('closeModal');
    }).appendTo($modalList);

    $modal.css({ height: '+=12px' });
  }
}
