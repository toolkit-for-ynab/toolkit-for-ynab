import Feature from 'core/feature';

export default class HideReferralBanner extends Feature {
  shouldInvoke() { return false; }

  injectCSS() {
    return `
      div.referral-program {
        display: none;
      }
    `;
  }
}
