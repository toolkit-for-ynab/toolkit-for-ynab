import { Feature } from 'toolkit/extension/features/feature';

export class GoogleFontsSelector extends Feature {
  injectCSS() {
    if (this.settings.enabled === '1') {
      return require('./open-sans.css');
    }
    if (this.settings.enabled === '2') {
      return require('./roboto.css');
    }
    if (this.settings.enabled === '3') {
      return require('./roboto-condensed.css');
    }
    if (this.settings.enabled === '4') {
      return require('./droid-sans.css');
    }
    if (this.settings.enabled === '5') {
      return require('./inconsolata.css');
    }
    if (this.settings.enabled === '6') {
      return require('./system-ui.css');
    }
  }
}
