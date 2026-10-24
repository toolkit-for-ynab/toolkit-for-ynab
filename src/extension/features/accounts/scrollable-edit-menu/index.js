import { Feature } from 'toolkit/extension/features/feature';

// YNAB replaced the register's Edit menu with the "More" menu on the
// selected-transactions action bar. Its menus are plain positioned lists now
// (the Ember view hooks this feature used to override are gone), so keeping
// them on screen is handled entirely in CSS.
export class ScrollableEditMenu extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  destroy() {}
}
