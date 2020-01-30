import { Feature } from 'toolkit/extension/features/feature';

export class BottomNotificationBar extends Feature {
  injectCSS() {
    // Position the account notification bar at the bottom
    return require('./index.css');
  }
}
