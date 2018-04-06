import { Feature } from 'toolkit/extension/features/feature';
import { getToolkitStorageKey, setToolkitStorageKey } from 'toolkit/extension/utils/toolkit';
import { getEmberView, controllerLookup } from 'toolkit/extension/utils/toolkit';

export class HideHelp extends Feature {
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

  getBeacon() {
    return getEmberView($('.self-service').attr('id'));
  }

  isBeaconHidden() {
    return this.getBeacon().getBeaconContainer().css('display') === 'none';
  }

  setHiddenState(state) {
    setToolkitStorageKey('hide-help', state);
    const beacon = this.getBeacon();
    if (state) {
      beacon.hideContainer();
    } else {
      beacon.showContainer();
    }
  }

  updatePopupButton() {
    const isBeaconHidden = this.isBeaconHidden();
    const $modal = $('.modal-user-prefs .modal');
    const $modalList = $('.modal-user-prefs .modal-list');

    if ($('.ynab-toolkit-hide-help', $modalList).length) return;

    // it's possible the beacon doesn't actually match the state we think it should so don't
    // set the label based on what we have in local storage so we should always use the source
    // of truth when toggling. We'll use local storage to get the initial state.
    const label = isBeaconHidden ? 'Hide' : 'Show';

    $(`<li class="ynab-toolkit-hide-help">
      <button>
        <i class="flaticon stroke help-2"></i>
        ` + label + ` Help Button
      </button>
     </li>
    `).click(() => {
      this.setHideState(!isBeaconHidden);
      controllerLookup('controller:accounts').send('closeModal');
    }).appendTo($modalList);

    $modal.css({ height: '+=12px' });
  }
}
