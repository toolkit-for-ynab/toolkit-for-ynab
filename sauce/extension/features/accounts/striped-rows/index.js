import { Feature } from 'toolkit/core/extension/feature';

export class AccountsStripedRows extends Feature {
  injectCSS() { return require('./index.css'); }
}
