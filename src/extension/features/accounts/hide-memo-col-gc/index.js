import { Feature } from 'toolkit/extension/features/feature';

export class HideMemoColGc extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return false;
  }
}
