interface YNABBudgetMonthDisplayItem {
  categoryId: string;
  displayName: string;
  budgeted: number;
  underfundedAmount: number;
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
