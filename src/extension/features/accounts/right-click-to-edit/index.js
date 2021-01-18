import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

const SCREEN_PADDING = 8;
const ROW_ARROW_DOWN_START = 34 * 0.75;
const ROW_ARROW_UP_START = 34 * 0.25;
const ARROW_HORIZONTAL_OFFSET = 8;

export class RightClickToEdit extends Feature {
  isCurrentlyRunning = false;

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  displayContextMenu(event) {
    let $element = $(this);
    // check for a right click on a split transaction
    if ($element.hasClass('ynab-grid-body-sub')) {
      // select parent transaction
      $element = $element.prevAll('.ynab-grid-body-parent:first');
    }

    if (!$element.hasClass('is-checked')) {
      // clear existing, then check current
      $('.ynab-checkbox-button.is-checked').click();
      $element.find('.ynab-checkbox-button').click();
    }

    // make context menu appear
    $('.accounts-toolbar-edit-transaction').click();

    // determine if modal needs to be positioned above or below clicked element
    const $modal = $('.modal-account-edit-transaction-list .modal');
    const modalHeight = $modal.outerHeight();
    const modalWidth = $modal.outerWidth();
    const halfModalWidth = modalWidth / 2;
    const $modalArrow = $modal.find('.modal-arrow');
    const modalArrowHeight = $modalArrow.outerHeight();
    const modalArrowWidth = $modalArrow.outerWidth();
    const halfModalArrowWidth = modalArrowWidth / 2;
    const $window = $(window);
    const windowHeight = $window.height();
    const windowWidth = $window.width();
    const modalClipsTop = event.pageY - modalHeight < SCREEN_PADDING;
    const modalClipsBottom = event.pageY + modalHeight > windowHeight - SCREEN_PADDING;
    const modalClipsLeft = event.pageX - modalWidth < SCREEN_PADDING;
    const modalClipsRight = event.pageX + modalWidth > windowWidth - SCREEN_PADDING;

    // sometimes, offset is undefined -- if this is the case, just show the normal un-positioned edit menu
    const offset = $element.offset(); // move context menu
    if (!offset) {
      return;
    }

    Ember.run.next(() => {
      let top;
      let left = event.pageX - halfModalWidth;
      let arrowLeft = halfModalWidth - halfModalArrowWidth;
      let arrowBottom = '100%';
      let cls;
      if (!modalClipsBottom) {
        cls = 'modal-below';
        top = offset.top + modalArrowHeight + ROW_ARROW_DOWN_START;
      } else if (!modalClipsTop) {
        cls = 'modal-above';
        top = offset.top - modalHeight - ROW_ARROW_UP_START;
        arrowBottom = 'auto';
      } else {
        // Clips both top and bottom, need to position to side
        top = windowHeight - modalHeight - SCREEN_PADDING;
        arrowBottom = modalHeight - event.pageY + top - halfModalArrowWidth;
        if (top > event.pageY - halfModalArrowWidth) {
          top = `calc(${event.pageY}px - ${$modal.css(
            'border-top-left-radius'
          )} - ${halfModalArrowWidth}px`;
        }
        if (!modalClipsRight) {
          cls = 'modal-right';
          left = event.pageX + modalArrowHeight + ARROW_HORIZONTAL_OFFSET;
          arrowLeft = -modalArrowWidth;
        } else if (!modalClipsLeft) {
          cls = 'modal-left';
          left = event.pageX - modalWidth - modalArrowHeight - ARROW_HORIZONTAL_OFFSET;
          arrowLeft = modalWidth;
        } else {
          // Can't display the modal at all without clipping
          top = event.pageY + halfModalArrowWidth;
          arrowLeft = halfModalWidth - halfModalArrowWidth;
        }
      }

      // If the modal clips outside the screen left or right then stick it to the edge
      if (left + modalWidth > windowWidth - SCREEN_PADDING) {
        left = windowWidth - modalWidth - SCREEN_PADDING;
        arrowLeft = event.pageX - left - halfModalArrowWidth;
      } else if (left < SCREEN_PADDING) {
        left = SCREEN_PADDING;
        arrowLeft = event.pageX - SCREEN_PADDING - halfModalArrowWidth;
      }

      // Re-position any sub lists that would open to the right of the right edge
      const modalRight = left + modalWidth;
      $modal
        .find('.modal-list>li>ul')
        .filter((_, subList) => modalRight + $(subList).outerWidth() > windowWidth)
        .addClass('modal-sub-left');

      $modal
        .addClass(cls)
        .css('left', left)
        .css('top', top);

      $modalArrow.css('left', arrowLeft).css('bottom', arrowBottom);
    });

    return false;
  }

  hideContextMenu() {
    return false; // ignore right clicks
  }

  invoke() {
    this.isCurrentlyRunning = true;

    Ember.run.next(this, function() {
      $('.ynab-grid').off('contextmenu', '.ynab-grid-body-row', this.displayContextMenu);
      $('.ynab-grid').on('contextmenu', '.ynab-grid-body-row', this.displayContextMenu);

      $('body').off('contextmenu', '.modal-account-edit-transaction-list', this.hideContextMenu);
      $('body').on('contextmenu', '.modal-account-edit-transaction-list', this.hideContextMenu);

      this.isCurrentlyRunning = false;
    });
  }

  observe(changedNodes) {
    if (!this.shouldInvoke() || this.isCurrentlyRunning) return;

    if (changedNodes.has('ynab-grid-body')) {
      this.invoke();
    }
  }
}
