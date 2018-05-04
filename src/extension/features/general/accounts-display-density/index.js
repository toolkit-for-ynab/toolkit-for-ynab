import { Feature } from 'toolkit/extension/features/feature';

export class AccountsDisplayDensity extends Feature {
  injectCSS() {
    if (YNABFEATURES.get('sidebar-di-next') !== undefined) {
      if (this.settings.enabled === '1') {
        return require('./sidebar-di-next/compact.css');
      } else if (this.settings.enabled === '2') {
        return require('./sidebar-di-next/slim.css');
      }
    }

    if (this.settings.enabled === '1') {
      return require('./compact.css');
    } else if (this.settings.enabled === '2') {
      return require('./slim.css');
    }
  }
}
