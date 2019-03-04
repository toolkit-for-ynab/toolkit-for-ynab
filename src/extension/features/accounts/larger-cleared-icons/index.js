import { Feature } from 'toolkit/extension/features/feature';

export class LargerClickableIcons extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
