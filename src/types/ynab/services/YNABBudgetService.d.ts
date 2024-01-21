import type { DateWithoutTime } from '../window/ynab-utilities';

interface YNABBudgetMonthDisplayItem {
  categoryId: string;
  budgeted: number;
  goalTarget: number;
}

interface YNABBudgetService {
  activeCategory: {};
  budgetViewModel?: {
    allBudgetMonthsViewModel: {};
    month: DateWithoutTime;
  };
  checkedRowsCount: number;
  checkedRows: YNABBudgetMonthDisplayItem[];
  inspectorCategories: [];
}
