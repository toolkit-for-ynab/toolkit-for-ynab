import { Feature } from 'toolkit/extension/features/feature';

export class ColourBlindMode extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
