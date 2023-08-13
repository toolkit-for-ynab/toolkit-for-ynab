interface YNABBudgetMonthDisplayItem {
  categoryId: string;
  budgeted: number;
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
