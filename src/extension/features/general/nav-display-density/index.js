import { Feature } from 'toolkit/extension/features/feature';

export class NavDisplayDensity extends Feature {
  injectCSS() {
    if (this.settings.enabled === '1') {
      return require('./compact.css');
    }
    if (this.settings.enabled === '2') {
      return require('./slim.css');
    }
  }
}
