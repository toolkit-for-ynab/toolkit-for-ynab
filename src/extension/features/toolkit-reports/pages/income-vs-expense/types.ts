import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';
import { IncomeVsExpenseComponent } from './component';
import { DateWithoutTime } from 'toolkit/types/ynab/window/ynab-utilities';
import { YNABMasterCategory } from 'toolkit/types/ynab/data/master-category';
import { YNABPayee } from 'toolkit/types/ynab/data/payee';
import { YNABSubCategory } from 'toolkit/types/ynab/data/sub-category';

export type MonthlyTotals = {
  date: DateWithoutTime;
  total: number;
  transactions: YNABTransaction[];
};

export type MonthlyTotalsMap = Record<string, MonthlyTotals>;

export type PayeeMap = {
  payee: YNABPayee;
  monthlyTotals: MonthlyTotalsMap;
};

export type SubCategoryMap = {
  subCategory: YNABSubCategory;
  monthlyTotals: MonthlyTotalsMap;
};

export type MasterCategoryMap = {
  masterCategory: YNABMasterCategory;
  monthlyTotals: MonthlyTotalsMap;
  subCategories: Record<string, SubCategoryMap>;
};

export type Incomes = {
  payees: Record<string, PayeeMap>;
  monthlyTotals: MonthlyTotalsMap;
};
export type Expenses = {
  masterCategories: Record<string, MasterCategoryMap>;
  monthlyTotals: MonthlyTotalsMap;
};

export type NormalizedNetIncome = {
  date: DateWithoutTime;
  total: number;
  transactions: YNABTransaction[];
};

export type NormalizedIncomes = ReturnType<IncomeVsExpenseComponent['_sortAndNormalizeIncomes']>;
export type NormalizedExpenses = ReturnType<IncomeVsExpenseComponent['_sortAndNormalizeExpenses']>;
export type NormalizedNetIncomes = ReturnType<IncomeVsExpenseComponent['_normalizeNetIncomes']>;
