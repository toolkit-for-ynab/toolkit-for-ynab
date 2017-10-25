import { Feature } from 'toolkit/core/feature';

export class RemovePositiveHighlight extends Feature {
  injectCSS() { return require('./index.css'); }
}
