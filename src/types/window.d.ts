import { YNABApp, YNABGlobal } from './ynab/window';
import { YNABToolkitObject } from './toolkit';

declare global {
  const Ember: Ember;
  const ynab: YNABGlobal;
  const ynabToolKit: YNABToolkitObject;
  const YNABFEATURES: any;
  const __ynabapp__: YNABApp;
  const __toolkitUtils: unknown;

  interface Window {
    __toolkitUtils: unknown;
    ynabToolKit: YNABToolkitObject;
  }
}
