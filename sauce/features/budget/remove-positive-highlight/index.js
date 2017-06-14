import Feature from 'core/feature';

export default class RemovePositiveHighlight extends Feature {
  injectCSS() { return require('./index.css'); }
}
