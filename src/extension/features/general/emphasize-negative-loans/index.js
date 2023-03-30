import { Feature } from 'toolkit/extension/features/feature';

export class EmphasizeNegativeLoans extends Feature {
  injectCSS() {
    return require('./index.css');
  }
}
