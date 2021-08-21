import { Feature } from 'toolkit/extension/features/feature';

export class HighlightNegatives extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
