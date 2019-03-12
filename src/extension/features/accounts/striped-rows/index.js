import { Feature } from 'toolkit/extension/features/feature';

export class AccountsStripedRows extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
