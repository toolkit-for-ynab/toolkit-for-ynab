import { Feature } from 'core/feature';

export class hideHelp extends Feature {

  injectCSS() { return require('./index.css'); }

  shouldInvoke() {
    if (this.settings.enabled === true) {
      return true;
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('ynab-u modal-popup modal-user-prefs ember-view modal-overlay active')) {
      this.invoke();
    }
  }

  invoke() {
    let hide = ynabToolKit.shared.getToolkitStorageKey('hide-help', 'boolean');

    if (hide === null) {
      ynabToolKit.shared.setToolkitStorageKey('hide-help', 'true');
      hide = 'true';
    }

    if (hide === true) {
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
      let hide = !ynabToolKit.shared.getToolkitStorageKey('hide-help', 'boolean');
      ynabToolKit.shared.setToolkitStorageKey('hide-help', hide);
      $('body').toggleClass('toolkit-hide-help');
      let accountController = ynabToolKit.shared.containerLookup('controller:accounts');
      accountController.send('closeModal');
    }).appendTo($modalList);

    $modal.css({ height: '+=12px' });
  }
}
