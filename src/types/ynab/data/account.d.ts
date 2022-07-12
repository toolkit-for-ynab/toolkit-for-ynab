import { YNABAccountType } from '../window/ynab-enums';
import { YNABTransaction } from './transaction';

export interface YNABAccount {
  accountName: string;
  getAccountType(): YNABAccountType;
  getAccountCalculation(): YNABAccountCalculation;
  getTransactions(): YNABTransaction[];
}
