import type { DateWithoutTime } from '../window/ynab-utilities';

export interface YNABBudgetMonthDisplayItem {
  categoryId: string;
  budgeted: number;
  goalTarget: number;
}

export interface YNABBudgetService {
  activeCategory: {};
  budgetViewModel?: {
    allBudgetMonthsViewModel: {};
    month: DateWithoutTime;
  };
  checkedRowsCount: number;
  checkedRows: YNABBudgetMonthDisplayItem[];
  inspectorCategories: [];
}
