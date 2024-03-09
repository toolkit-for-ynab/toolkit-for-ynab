import type { YNABConstants } from './ynab-constants';
import type { YNABEnums } from './ynab-enums';
import type { YNABSharedLib } from './ynab-shared-lib';
import type { YNABUtilities } from './ynab-utilities';

export interface YNABGlobal {
  YNABSharedLib: YNABSharedLib;
  YNABSharedLibWebInstance: YNABSharedLibWebInstance;
  collections: unknown;
  constants: YNABConstants;
  convertFromMilliDollars(milliDollars: number | string): number;
  convertToMilliDollars(milliDollars: number | string): number;
  enums: YNABEnums;
  formatCurrency(amount: number | string): string;
  formatDate(date?: Date | string, format?: string): string;
  formatDateLong(date?: Date | string): string;
  unformat(input: string | number): number;
  utilities: YNABUtilities;
}

export interface YNABApp {
  __container__: {
    lookup<T extends unknown>(key: string): T | undefined;
    factoryFor<T extends unknown>(key: string): T | undefined;
    cache: {
      [key: string]: unknown;
    };
  };
}
