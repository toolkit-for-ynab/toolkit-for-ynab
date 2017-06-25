import { Feature } from 'core/feature';

export class AccountsDisplayDensity extends Feature {
  injectCSS() {
    if (this.settings.enabled === '1') {
      return require('./compact.css');
    } else if (this.settings.enabled === '2') {
      return require('./slim.css');
    }
  }
}
