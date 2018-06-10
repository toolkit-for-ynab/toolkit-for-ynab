import { Feature } from 'toolkit/extension/features/feature';

export class EditAccountButton extends Feature {
  injectCSS() {
    if (this.settings.enabled === '1' && !YNABFEATURES['edit-account-icon']) {
      return require('./hide.css');
    }
  }
}
