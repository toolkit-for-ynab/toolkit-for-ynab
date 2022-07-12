import { YNABEnums } from './ynab-enums';
import { YNABSharedLib } from './ynab-shared-lib';

interface YNABGlobal {
  YNABSharedLib: YNABSharedLib;
  YNABSharedLibWebInstance: unknown;
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

interface YNABApp {
  __container__: {
    lookup<T extends unknown>(key: string): T | undefined;
    factoryFor<T extends unknown>(key: string): T | undefined;
    cache: {
      [key: string]: unknown;
    };
  };
}
