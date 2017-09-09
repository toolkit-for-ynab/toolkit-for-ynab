import { Feature } from 'core/feature';

export class ColourBlindMode extends Feature {
  injectCSS() { return require('./index.css'); }
}
