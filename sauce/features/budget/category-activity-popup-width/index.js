import { Feature } from 'toolkit/core/feature';

export class CategoryActivityPopupWidth extends Feature {
  injectCSS() {
    if (this.settings.enabled === '1') {
      return require('./medium.css');
    } else if (this.settings.enabled === '2') {
      return require('./large.css');
    }
  }
}
