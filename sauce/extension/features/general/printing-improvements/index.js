import { Feature } from 'toolkit/core/extension/feature';

export class PrintingImprovements extends Feature {
  injectCSS() { return require('./index.css'); }
}
