import type { DateWithoutTime } from '../window/ynab-utilities';

export interface YNABBudgetMonthDisplayItem {
  budgeted: number;
  categoryId: string;
  displayName: string;
  goalTarget: number;
  isMasterCategory: boolean;
  masterCategory: any;
  subCategoryId: string;
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
