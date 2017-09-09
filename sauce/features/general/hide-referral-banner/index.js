import { Feature } from 'core/feature';

export class HideReferralBanner extends Feature {
  injectCSS() { return require('./index.css'); }
}
