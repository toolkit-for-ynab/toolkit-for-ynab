import { Feature } from 'toolkit/extension/features/feature';

export class MasterCategoryRowColor extends Feature {
  injectCSS() {
    const css = require('./index.css');
    const defaultThemeColor = ynabToolKit.options.MasterCategoryRowColorSelect;
    const darkThemeColor = ynabToolKit.options.MasterCategoryRowDarkColorSelect;

    let patchedCSS = css.replace('var(--neutral300)', defaultThemeColor);
    patchedCSS = patchedCSS.replace('var(--neutral700)', darkThemeColor);
    return patchedCSS;
  }
}
