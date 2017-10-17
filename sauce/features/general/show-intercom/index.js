import { Feature } from 'core/feature';

export class showIntercom extends Feature {

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
    let $modal = $('.modal-user-prefs .modal');
    let $modalList = $('.modal-user-prefs .modal-list');

    if ($('.ynab-toolkit-show-intercom', $modalList).length) return;

    $(`<li class="ynab-toolkit-show-intercom">
        <button>
          <i class="flaticon stroke warning-2"></i>
          Show Intercom
        </button>
      </li>
    `).click(() => {
      Intercom('show'); // eslint-disable-line new-cap
      let accountController = ynabToolKit.shared.containerLookup('controller:accounts');
      accountController.send('closeModal');
    }).appendTo($modalList);

    $modal.css({ height: '+=12px' });
  }
}
