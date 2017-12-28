import { Feature } from 'toolkit/core/extension/feature';

export class ColourBlindMode extends Feature {
  injectCSS() { return require('./index.css'); }
}
