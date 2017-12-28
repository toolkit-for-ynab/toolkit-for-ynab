import { Feature } from 'toolkit/core/extension/feature';
import * as toolkitHelper from 'toolkit/extension/helpers/toolkit';

export class ShowIntercom extends Feature {
  shouldInvoke() {
    // should only invoke when the user settings modal is open which isn't
    // going to be the case when this lifecycle method is called.
    return false;
  }

  invoke() {
    const $modal = $('.modal-user-prefs .modal');
    const $modalList = $('.modal-user-prefs .modal-list');

    if ($('.ynab-toolkit-show-intercom', $modalList).length) return;

    $(`<li class="ynab-toolkit-show-intercom">
        <button>
          <i class="flaticon stroke warning-2"></i>
          Show Intercom
        </button>
      </li>
    `).click(() => {
      const accountController = toolkitHelper.controllerLookup('accounts');
      window.Intercom('show'); // eslint-disable-line new-cap
      accountController.send('closeModal');
    }).appendTo($modalList);

    $modal.css({ height: '+=12px' });
  }

  observe(changedNodes) {
    if (changedNodes.has('ynab-u modal-popup modal-user-prefs ember-view modal-overlay active')) {
      this.invoke();
    }
  }
}
