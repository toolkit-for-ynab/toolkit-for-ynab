import { Feature } from 'toolkit/extension/features/feature';

export class PrintingImprovements extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
