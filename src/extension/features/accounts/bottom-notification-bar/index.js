import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { componentLookup } from 'toolkit/extension/utils/ember';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';

const POSITIONED_AT_BOTTOM_CSS_VAR = '--tk-positioned-at-bottom';

export class BottomNotificationBar extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    function moveNotification(element) {
      if ($(element)[0].style.getPropertyValue(POSITIONED_AT_BOTTOM_CSS_VAR) === '1') {
        return;
      }

      $(element)[0].style.setProperty(POSITIONED_AT_BOTTOM_CSS_VAR, '1');
      $(element).appendTo($(element).parent());
    }

    const accountNotificationProto = Object.getPrototypeOf(
      componentLookup('accounts/account-notification')
    );

    addToolkitEmberHook(this, accountNotificationProto, 'didRender', moveNotification);
  }
}
