import type { YNABApp, YNABGlobal } from './ynab/window';
import type { YNABToolkitObject } from './toolkit';

declare global {
  const ynab: YNABGlobal;
  const ynabToolKit: YNABToolkitObject;
  const __toolkitUtils: unknown;

  const YNAB: {
    NAMESPACES: [YNABApp];
  };

  interface Window {
    __toolkitUtils: unknown;
    ynabToolKit: YNABToolkitObject;
  }
}
