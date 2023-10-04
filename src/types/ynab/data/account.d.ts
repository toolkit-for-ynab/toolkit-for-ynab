import { YNABAccountType } from '../window/ynab-enums';
import { YNABTransaction } from './transaction';

export interface YNABAccount {
  accountName: string;
  accountType: YNABAccountType;
  accountCalculation: YNABAccountCalculation;
  getTransactions(): YNABTransaction[];
}
