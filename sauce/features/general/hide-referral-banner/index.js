import Feature from 'core/feature';

export default class HideReferralBanner extends Feature {
  injectCSS() { return require('./index.css'); }
}
