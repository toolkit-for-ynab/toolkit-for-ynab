import { Feature } from 'toolkit/extension/features/feature';

export class RowHeight extends Feature {
  injectCSS() {
    let css = require('./index.css');

    if (this.settings.enabled === '1') {
      css += require('./compact.css');
    } else if (this.settings.enabled === '2') {
      css += require('./slim.css');
    }

    return css;
  }
}
