interface YNABBudgetMonthDisplayItem {
  categoryId: string;
  budgeted: number;
}

interface YNABBudgetController {
  applicationService: YNABApplicationService;
  budgetViewModel?: {
    allBudgetMonthsViewModel: {};
  };
  checkedRowsCount: number;
  checkedRows: YNABBudgetMonthDisplayItem[];
  monthString: string;
}
