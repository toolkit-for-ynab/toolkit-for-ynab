import Feature from 'core/feature';

export default class ColourBlindMode extends Feature {
  injectCSS() { return require('./index.css'); }
}
