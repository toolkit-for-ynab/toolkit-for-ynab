import { Feature } from 'toolkit/extension/features/feature';

export class AccountsStripedRows extends Feature {
  injectCSS() {
    const css = require('./index.css');
    const defaultThemeColor = ynabToolKit.options.AccountsStripedRowsColor;
    const darkThemeColor = ynabToolKit.options.AccountsStripedRowsDarkColor;

    let defaultThemePatched = false;
    const patchedCSS = css.replace(/#[A-Fa-f0-9]{6}/gi, match => {
      if (!defaultThemePatched) {
        defaultThemePatched = true;
        return defaultThemeColor || match;
      }
      return darkThemeColor || match;
    });
    return patchedCSS;
  }
}
