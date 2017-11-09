import { Feature } from 'toolkit/core/feature';

export class HideAgeOfMoney extends Feature {
  injectCSS() { return require('./index.css'); }
}
