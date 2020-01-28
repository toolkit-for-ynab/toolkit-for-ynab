import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

const WIDTH_CSS_VAR = '--tk-number-resize-sidebar-width-from-code';
const NOTIFICATION_BAR_CSS_KEY = 'accounts-notification';

export class BottomNotificationBar extends Feature {
  resizer = null;

  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  setInitialLeftPosAndWidth() {
    let resizedWidth = $(':root')[0].style.getPropertyValue(WIDTH_CSS_VAR);
    if (resizedWidth) {
      this.updateLeftPosAndWidth(resizedWidth);
    }
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.setInitialLeftPosAndWidth();
    }
  }

  observe() {
    let notificationBarIsVisible = $('.' + NOTIFICATION_BAR_CSS_KEY).length > 0;
    if (this.shouldInvoke() && notificationBarIsVisible) {
      this.setInitialLeftPosAndWidth();
    }
  }

  invoke() {
    this.setInitialLeftPosAndWidth();

    // Listen for resizes
    const MutationObserver =
      window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

    const config = {
      attributes: true,
    };

    let lastResizedWidth = -1;
    let lastDocumentWidth = -1;
    let documentObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
          // Update the notification bar left position with the newly resized width of the sidebar
          let resizedWidth = $(':root')[0].style.getPropertyValue(WIDTH_CSS_VAR);
          let documentWidth = document.width;
          if (
            resizedWidth &&
            (lastResizedWidth !== resizedWidth || lastDocumentWidth !== documentWidth)
          ) {
            this.updateLeftPosAndWidth(resizedWidth);
            lastResizedWidth = resizedWidth;
            lastDocumentWidth = documentWidth;
          }
        }
      });
    });

    documentObserver.observe($(':root')[0], config);
  }

  updateLeftPosAndWidth(left) {
    // Update the left position of the notification bar so it stays aligned with the transaction view
    console.log(left);
    $('.' + NOTIFICATION_BAR_CSS_KEY).css('left', left);
    $('.' + NOTIFICATION_BAR_CSS_KEY)
      .css('width', '100vw')
      .css('width', '-=' + left);
  }
}
