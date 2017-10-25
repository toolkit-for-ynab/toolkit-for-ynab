import { Feature } from 'toolkit/core/feature';

export class RowsHeight extends Feature {
  injectCSS() {
    if (this.settings.enabled === '1') {
      return require('./compact.css');
    } else if (this.settings.enabled === '2') {
      return require('./slim.css');
    } else if (this.settings.enabled === '3') {
      return require('./slim-fonts.css');
    }
  }
}
