import { Feature } from 'core/feature';

export class BetterScrollbars extends Feature {
  injectCSS() {
    if (this.settings.enabled === '1') {
      return require('./small.css');
    } else if (this.settings.enabled === '2') {
      return require('./tiny.css');
    } else if (this.settings.enabled === '3') {
      return require('./off.css');
    }
  }
}
