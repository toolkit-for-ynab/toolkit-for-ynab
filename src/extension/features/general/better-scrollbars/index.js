import { Feature } from 'toolkit/extension/features/feature';

export class BetterScrollbars extends Feature {
  injectCSS() {
    if (this.settings.enabled === '1') {
      return require('./small.css');
    }
    if (this.settings.enabled === '2') {
      return require('./tiny.css');
    }
    if (this.settings.enabled === '3') {
      return require('./off.css');
    }
  }
}
