import { Feature } from 'toolkit/extension/features/feature';

export class CategoryActivityPopupWidth extends Feature {
  injectCSS() {
    if (this.settings.enabled === '1') {
      return require('./medium.css');
    }
    if (this.settings.enabled === '2') {
      return require('./large.css');
    }
  }
}
