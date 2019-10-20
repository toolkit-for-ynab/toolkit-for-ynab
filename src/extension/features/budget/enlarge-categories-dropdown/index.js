import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';

const DEFAULT_ADDITIONAL_HEIGHT = 100; // 4 pixels of padding
const BOTTOM_OF_PAGE_PADDING = 4;

export class EnlargeCategoriesDropdown extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    let modal = $('.categories-dropdown-container .dropdown-modal');
    if (modal.length) {
      let totalAdditionalHeight = DEFAULT_ADDITIONAL_HEIGHT + BOTTOM_OF_PAGE_PADDING;
      let currentTop = parseInt(modal.css('top'));
      let spaceAvailableAboveModal =
        $(window).height() - (modal.offset().top - modal.outerHeight());
      let spaceAvailableBelowModal =
        $(window).height() - (modal.offset().top + modal.outerHeight());

      // modal is shown above autocomplete
      if (currentTop < 0) {
        if (spaceAvailableAboveModal < totalAdditionalHeight) {
          // pad the bottom of the screen with 4 pixels here.
          modal.css({
            height: '+=' + (spaceAvailableAboveModal - BOTTOM_OF_PAGE_PADDING),
            top: '-=' + (spaceAvailableAboveModal - BOTTOM_OF_PAGE_PADDING),
          });
        } else if (spaceAvailableAboveModal >= totalAdditionalHeight) {
          modal.css({
            height: '+=' + DEFAULT_ADDITIONAL_HEIGHT,
            top: '-=' + DEFAULT_ADDITIONAL_HEIGHT,
          });
        }
      } else if (spaceAvailableBelowModal < totalAdditionalHeight) {
        modal.css({
          height: '+=' + (spaceAvailableBelowModal - BOTTOM_OF_PAGE_PADDING),
        });
      } else if (spaceAvailableBelowModal >= totalAdditionalHeight) {
        modal.css({ height: '+=' + DEFAULT_ADDITIONAL_HEIGHT });
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
