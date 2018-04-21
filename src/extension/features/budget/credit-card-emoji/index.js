import { Feature } from 'toolkit/extension/features/feature';

export class CreditCardEmoji extends Feature {
  injectCSS() {
    return require('./credit.css');
  }
}
