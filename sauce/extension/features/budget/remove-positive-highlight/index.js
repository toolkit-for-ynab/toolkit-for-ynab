import { Feature } from 'toolkit/core/extension/feature';

export class RemovePositiveHighlight extends Feature {
  injectCSS() { return require('./index.css'); }
}
