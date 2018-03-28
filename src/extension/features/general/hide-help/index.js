import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';

export class HideHelp extends Feature {
  injectCSS() { return require('./index.css'); }

  shouldInvoke() {
    return true;
  }

  observe(changedNodes) {
    if (changedNodes.has('ynab-u modal-popup modal-user-prefs ember-view modal-overlay active')) {
      this.invoke();
    }
  }

  invoke() {
    const hide = getToolkitStorageKey('hide-help', true);

    if (hide) {
      $('body').addClass('toolkit-hide-help');
    }

    this.updatePopupButton();
  }

  updatePopupButton() {
    let $modal = $('.modal-user-prefs .modal');
    let $modalList = $('.modal-user-prefs .modal-list');

    if ($('.ynab-toolkit-hide-help', $modalList).length) return;

    let $label = 'Show';
    if ($('#hs-beacon').is(':visible')) { $label = 'Hide'; }

    $(`<li class="ynab-toolkit-hide-help">
      <button>
        <i class="flaticon stroke help-2"></i>
        ` + $label + ` Help Button
      </button>
     </li>
    `).click(() => {
<<<<<<< HEAD
      const hide = getToolkitStorageKey('hide-help', true);
      setToolkitStorageKey('hide-help', !hide);

=======
      let hide = !getToolkitStorageKey('hide-help');
      setToolkitStorageKey('hide-help', hide);
>>>>>>> Automatically JSON.parse local storage values when using toolkit helpers
      $('body').toggleClass('toolkit-hide-help');
      const accountController = ynabToolKit.shared.containerLookup('controller:accounts');
      accountController.send('closeModal');
    }).appendTo($modalList);

    $modal.css({ height: '+=12px' });
  }
}
