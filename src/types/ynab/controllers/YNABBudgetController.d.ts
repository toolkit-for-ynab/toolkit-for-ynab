interface YNABBudgetController {
  applicationService: YNABApplicationService;
  budgetService: YNABBudgetService;
  budgetViewModel?: {
    allBudgetMonthsViewModel: {};
    month: DateWithoutTime;
  };
}
