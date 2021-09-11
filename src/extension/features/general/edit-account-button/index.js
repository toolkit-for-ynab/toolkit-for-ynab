import { Feature } from 'toolkit/extension/features/feature';

export class EditAccountButton extends Feature {
  injectCSS() {
    return require('./hide.css');
  }
}
