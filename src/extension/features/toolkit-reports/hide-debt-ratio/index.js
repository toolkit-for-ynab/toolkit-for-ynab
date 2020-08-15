import { Feature } from 'toolkit/extension/features/feature';

export class ShowDebtRatio extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
