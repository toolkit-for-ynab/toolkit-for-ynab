import { Feature } from 'toolkit/extension/features/feature';

export class RemovePositiveHighlight extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
