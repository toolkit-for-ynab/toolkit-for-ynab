interface YNABBudgetMonthDisplayItem {
  categoryId: string;
  budgeted: number;
}

interface YNABBudgetService {
  activeCategory: {};
  checkedRowsCount: number;
  checkedRows: YNABBudgetMonthDisplayItem[];
  inspectorCategories: [];
}
