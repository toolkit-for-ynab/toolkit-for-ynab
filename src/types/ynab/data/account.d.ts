import { YNABAccountType } from '../window/ynab-enums';

interface YNABAccount {
  getAccountType(): YNABAccountType;
  getAccountCalculation(): YNABAccountCalculation;
}
