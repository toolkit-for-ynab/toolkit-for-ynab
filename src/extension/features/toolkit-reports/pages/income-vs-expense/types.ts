import { Moment } from 'moment';
import { YNABTransaction } from 'toolkit/types/ynab/data/transaction';
import { IncomeVsExpenseComponent } from './component';

export type MonthlyTotals = {
  date: Moment;
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

export type NormalizedIncomes = ReturnType<IncomeVsExpenseComponent['_sortAndNormalizeIncomes']>;
export type NormalizedExpenses = ReturnType<IncomeVsExpenseComponent['_sortAndNormalizeExpenses']>;
export type NormalizedNetIncomes = ReturnType<IncomeVsExpenseComponent['_normalizeNetIncomes']>;
