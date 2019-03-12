import { Feature } from 'toolkit/extension/features/feature';

export class SeamlessBudgetHeader extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
