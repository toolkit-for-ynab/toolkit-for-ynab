import { Feature } from 'toolkit/extension/features/feature';

const Settings = {
  Hidden: '2',
};

export class EditAccountButton extends Feature {
  injectCSS() {
    if (this.settings.enabled === Settings.Hidden) {
      return require('./hide.css');
    }
  }
}
