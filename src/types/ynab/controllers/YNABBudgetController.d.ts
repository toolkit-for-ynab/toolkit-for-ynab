interface YNABBudgetMonthDisplayItem {
  categoryId: string;
  budgeted: number;
}

interface YNABBudgetController {
  applicationService: YNABApplicationService;
  budgetService: YNABBudgetService;
  budgetViewModel?: {
    allBudgetMonthsViewModel: {};
    month: DateWithoutTime;
  };
  checkedRowsCount: number;
  checkedRows: YNABBudgetMonthDisplayItem[];
}
