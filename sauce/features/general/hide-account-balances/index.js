import { Feature } from 'core/feature';

export class HideAccountBalancesType extends Feature {
  injectCSS() {
    if (this.settings.enabled === '1') {
      return require('./account.css') + require('./accountGroup.css');
    } else if (this.settings.enabled === '2') {
      return require('./accountGroup.css');
    } else if (this.settings.enabled === '3') {
      return require('./account.css');
    }
  }
}
