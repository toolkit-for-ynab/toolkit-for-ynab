import { Feature } from 'toolkit/extension/features/feature';

export class StripedBudgetRows extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
