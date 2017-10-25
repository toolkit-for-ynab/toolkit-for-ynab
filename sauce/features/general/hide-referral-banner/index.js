import { Feature } from 'toolkit/core/feature';

export class HideReferralBanner extends Feature {
  injectCSS() { return require('./index.css'); }
}
