import { YNABGlobal } from './ynab/window';
import { YNABToolkitObject } from './toolkit';

declare global {
  const ynab: YNABGlobal;
  const ynabToolKit: YNABToolkitObject;
  const __toolkitUtils: unknown;

  interface Window {
    __toolkitUtils: unknown;
    ynabToolKit: YNABToolkitObject;
    requireModule<T>(moduleName: string): T;
  }
}
