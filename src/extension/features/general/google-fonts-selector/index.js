import { Feature } from 'toolkit/extension/features/feature';

export class GoogleFontsSelector extends Feature {
  createStyleRule(fonts) {
    return `body,
      button,
      html,
      input,
      select,
      textarea {
        font-family: ${fonts};
      }`;
  }

  injectStylesheetLink(url) {
    $('#tk-google-fonts-selector').remove();
    $('head').append($('<link>', { href: url, rel: 'stylesheet', id: 'tk-google-fonts-selector' }));
  }

  destroy() {
    $('#tk-google-fonts-selector').remove();
  }

  injectCSS() {
    if (this.settings.enabled === '1') {
      this.injectStylesheetLink(
        'https://fonts.googleapis.com/css?family=Open+Sans:400,400italic,700',
      );
      return this.createStyleRule("'Open Sans', sans-serif");
    }
    if (this.settings.enabled === '2') {
      this.injectStylesheetLink('https://fonts.googleapis.com/css?family=Roboto:400,700,400italic');
      return this.createStyleRule("'Roboto', sans-serif");
    }
    if (this.settings.enabled === '3') {
      this.injectStylesheetLink(
        'https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700,400italic',
      );
      return this.createStyleRule("'Roboto Condensed', sans-serif");
    }
    if (this.settings.enabled === '4') {
      this.injectStylesheetLink('https://fonts.googleapis.com/css?family=Droid+Sans:400,700');
      return this.createStyleRule("'Droid Sans', sans-serif");
    }
    if (this.settings.enabled === '5') {
      this.injectStylesheetLink('https://fonts.googleapis.com/css?family=Inconsolata:400,700');
      return this.createStyleRule("'Inconsolata', monospace");
    }
    if (this.settings.enabled === '6') {
      this.injectStylesheetLink('https://fonts.googleapis.com/css?family=Roboto:400,700,400italic');
      return this.createStyleRule(
        "system-ui, -apple-system, 'Segoe UI', 'Roboto', 'Noto Sans', 'Ubuntu', 'Cantarell', sans-serif",
      );
    }
  }
}
