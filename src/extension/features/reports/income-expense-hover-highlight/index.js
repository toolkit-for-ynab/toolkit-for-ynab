import { Feature } from 'toolkit/extension/features/feature';

export class IncomeVsExpenseHoverHighlight extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
