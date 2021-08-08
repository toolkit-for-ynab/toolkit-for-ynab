import { Feature } from 'toolkit/extension/features/feature';

export class GoogleFontsSelector extends Feature {
  injectStylesheetLink(url) {
    $('head').append($('<link>', { href: url, rel: 'stylesheet' }));
  }

  injectCSS() {
    if (this.settings.enabled === '1') {
      this.injectStylesheetLink(
        'https://fonts.googleapis.com/css?family=Open+Sans:400,400italic,700'
      );
      return require('./open-sans.css');
    }
    if (this.settings.enabled === '2') {
      this.injectStylesheetLink('https://fonts.googleapis.com/css?family=Roboto:400,700,400italic');
      return require('./roboto.css');
    }
    if (this.settings.enabled === '3') {
      this.injectStylesheetLink(
        'https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700,400italic'
      );
      return require('./roboto-condensed.css');
    }
    if (this.settings.enabled === '4') {
      this.injectStylesheetLink('https://fonts.googleapis.com/css?family=Droid+Sans:400,700');
      return require('./droid-sans.css');
    }
    if (this.settings.enabled === '5') {
      this.injectStylesheetLink('https://fonts.googleapis.com/css?family=Inconsolata:400,700');
      return require('./inconsolata.css');
    }
    if (this.settings.enabled === '6') {
      this.injectStylesheetLink('https://fonts.googleapis.com/css?family=Roboto:400,700,400italic');
      return require('./system-ui.css');
    }
  }
}
