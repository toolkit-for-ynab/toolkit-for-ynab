import type { DateWithoutTime } from '../window/ynab-utilities';

export interface YNABBudgetMonthDisplayItem {
  categoryId: string;
  budgeted: number;
  goalTarget: number;
  subCategoryId: string;
  masterCategory: any;
  isMasterCategory: boolean;
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
  budgetMonthDisplayItems: YNABBudgetMonthDisplayItem[];
  budgetMonthDisplaySubCategoryItems: YNABBudgetMonthDisplayItem[];
}
