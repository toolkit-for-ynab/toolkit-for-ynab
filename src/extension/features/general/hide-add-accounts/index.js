import { Feature } from 'toolkit/extension/features/feature';

export class HideAddAccounts extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
