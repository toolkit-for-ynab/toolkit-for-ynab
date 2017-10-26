import { Feature } from 'toolkit/core/feature';

export class CreditCardEmoji extends Feature {
  injectCSS() {
    return require('./credit.css');
  }
}
