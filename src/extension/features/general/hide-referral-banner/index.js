import { Feature } from 'toolkit/extension/features/feature';

export class HideReferralBanner extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
