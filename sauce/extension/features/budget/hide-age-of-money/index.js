import { Feature } from 'toolkit/core/extension/feature';

export class HideAgeOfMoney extends Feature {
  injectCSS() { return require('./index.css'); }
}
