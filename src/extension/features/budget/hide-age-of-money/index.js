import { Feature } from 'toolkit/extension/features/feature';

export class HideAgeOfMoney extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
