import { Feature } from 'toolkit/extension/features/feature';

export class AccountsEmphasizedOutflows extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
