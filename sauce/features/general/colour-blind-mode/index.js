import { Feature } from 'toolkit/core/feature';

export class ColourBlindMode extends Feature {
  injectCSS() { return require('./index.css'); }
}
