import { Feature } from 'toolkit/core/feature';
import * as toolkitHelper from 'toolkit/helpers/toolkit';

const DEFAULTADDITIONALHEIGHT = 100; // 4 pixels of padding
const BOTTOMOFPAGEPADDING = 4;

export class EnlargeCategoriesDropdown extends Feature {
  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('budget') > -1;
  }

  invoke() {
    let modal = $('.categories-dropdown-container .dropdown-modal');
    if (modal.length) {
      let totalAdditionalHeight = DEFAULTADDITIONALHEIGHT + BOTTOMOFPAGEPADDING;
      let currentTop = parseInt(modal.css('top'));
      let spaceAvailableAboveModal = $(window).height() - (modal.offset().top - modal.outerHeight());
      let spaceAvailableBelowModal = $(window).height() - (modal.offset().top + modal.outerHeight());

      // modal is shown above autocomplete
      if (currentTop < 0) {
        if (spaceAvailableAboveModal < totalAdditionalHeight) {
          // pad the bottom of the screen with 4 pixels here.
          modal.css({
            height: '+=' + (spaceAvailableAboveModal - BOTTOMOFPAGEPADDING),
            top: '-=' + (spaceAvailableAboveModal - BOTTOMOFPAGEPADDING)
          });
        } else if (spaceAvailableAboveModal >= totalAdditionalHeight) {
          modal.css({
            height: '+=' + DEFAULTADDITIONALHEIGHT,
            top: '-=' + DEFAULTADDITIONALHEIGHT
          });
        }
      } else { // modal is shown below autocomplete
        if (spaceAvailableBelowModal < totalAdditionalHeight) {
          modal.css({ height: '+=' + (spaceAvailableBelowModal - BOTTOMOFPAGEPADDING) });
        } else if (spaceAvailableBelowModal >= totalAdditionalHeight) {
          modal.css({ height: '+=' + DEFAULTADDITIONALHEIGHT });
        }
      }
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) {
      return;
    }

    if (changedNodes.has('dropdown-container categories-dropdown-container')) {
      this.invoke();
    }
  }
}
