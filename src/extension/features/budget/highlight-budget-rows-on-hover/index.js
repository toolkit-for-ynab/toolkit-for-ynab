import { Feature } from 'toolkit/extension/features/feature';

export class HoveredBudgetRows extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
