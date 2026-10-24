import type { YNABAccountType } from '../window/ynab-enums';
import { YNABAccountCalculation } from './account-calculation';
import type { YNABTransaction } from './transaction';

export interface YNABAccount {
  entityId: string;
  accountName: string;
  accountType: YNABAccountType;
  accountCalculation: YNABAccountCalculation;
  getTransactions(): YNABTransaction[];
  onBudget: boolean;
  // loan/mortgage accounts; YNAB accrues their interest into the balance without transactions
  isDebtAccount?: boolean;
}
