import { Feature } from 'core/feature';

export class HideAgeOfMoney extends Feature {
  injectCSS() { return require('./index.css'); }
}
