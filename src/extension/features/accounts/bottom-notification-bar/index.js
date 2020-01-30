import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { componentLookup } from 'toolkit/extension/utils/ember';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';

const WIDTH_CSS_VAR = '--tk-number-resize-sidebar-width-from-code';
const POSITIONED_AT_BOTTOM_CSS_VAR = '--tk-positioned-at-bottom';
const NOTIFICATION_BAR_CSS_KEY = 'accounts-notification';

export class BottomNotificationBar extends Feature {
  lastResizedWidth = -1;

  injectCSS() {
    // Make the account notification bar a floating overlay. We can't just reposition the bar in the
    // DOM because it breaks the Ember references.
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  updateNotificationBarPositionAndWidth(type) {
    // Update the notification bar left position with the newly resized width of the sidebar

    // Retrieve the value set by the resizer plugin
    let resizedWidth = $(':root')[0].style.getPropertyValue(WIDTH_CSS_VAR);
    if (!resizedWidth) {
      // Fall back on the static sidebar width
      resizedWidth = $('.sidebar').width();
    }

    if (resizedWidth && (type === 'force' || this.lastResizedWidth !== resizedWidth)) {
      this.updateLeftPosAndWidth(resizedWidth);
      this.lastResizedWidth = resizedWidth;
    }
  }

  updateLeftPosAndWidth(left) {
    // Update the left position and width of the notification bar so it stays aligned with the transaction view
    $('.' + NOTIFICATION_BAR_CSS_KEY).css('left', left + 'px');
    $('.' + NOTIFICATION_BAR_CSS_KEY)
      .css('width', '100vw')
      .css('width', '-=' + left + 'px');
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.updateNotificationBarPositionAndWidth();
    }
  }

  invoke() {
    // Avoid double invoke()s - this happens occasionally
    let element = $('.' + NOTIFICATION_BAR_CSS_KEY);
    if ($(element)[0].style.getPropertyValue(POSITIONED_AT_BOTTOM_CSS_VAR) === '1') {
      return;
    }
    $(element)[0].style.setProperty(POSITIONED_AT_BOTTOM_CSS_VAR, '1');

    // Listen for resizes
    const MutationObserver =
      window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    // Only listen for changes to the 'style' attribute (the sidebar resizer plugin sets the resized value here)
    const config = {
      attributes: true,
      attributeFilter: ['style'],
    };

    // When the window is resized set the notification bar width
    let $this = this;
    function forcePositionAndWidthUpdate() {
      $this.updateNotificationBarPositionAndWidth('force');
    }

    // Listen for changes to the 'style' attribute set by the sidebar resizer plugin
    let sidebarObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
          $this.updateNotificationBarPositionAndWidth();
        }
      });
    });

    // Set up our resize listeners
    sidebarObserver.observe($(':root')[0], config);
    window.addEventListener('resize', forcePositionAndWidthUpdate);

    // When the component is initially shown we need to set up the position. This works when if it is repeatedly
    // hidden and shown (destroyed and rendered)
    const accountNotificationProto = Object.getPrototypeOf(
      componentLookup('accounts/account-notification')
    );
    addToolkitEmberHook(this, accountNotificationProto, 'didRender', forcePositionAndWidthUpdate);

    // Set initial position and width - works with or without resizer plugin
    this.updateNotificationBarPositionAndWidth();
  }
}
