import { Feature } from 'toolkit/extension/features/feature';

export class GoogleFontsSelector extends Feature {
  injectCSS() {
    if (this.settings.enabled === '1') {
      return require('./open-sans.css');
    } else if (this.settings.enabled === '2') {
      return require('./roboto.css');
    } else if (this.settings.enabled === '3') {
      return require('./roboto-condensed.css');
    } else if (this.settings.enabled === '4') {
      return require('./droid-sans.css');
    } else if (this.settings.enabled === '5') {
      return require('./inconsolata.css');
    }
  }
}
