interface YNABBudgetMonthDisplayItem {
  categoryId: string;
  budgeted: number;
}

interface YNABBudgetController {
  applicationService: YNABApplicationService;
  budgetService: YNABBudgetService;
  budgetViewModel?: {
    allBudgetMonthsViewModel: {};
  };
  checkedRowsCount: number;
  checkedRows: YNABBudgetMonthDisplayItem[];
}
