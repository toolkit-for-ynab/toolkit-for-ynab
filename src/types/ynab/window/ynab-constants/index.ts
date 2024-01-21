export interface YNABConstants {
  DisplayEntityType: {
    BudgetHeaderDisplayItem: 'budgetHeaderDisplayItem';
    BudgetMonthDisplayItem: 'budgetMonthDisplayItem';
    ChartColumnDisplayItem: 'chartColumnDisplayItem';
    ChartDataDisplayItem: 'chartDataDisplayItem';
    DatesFilterDisplayItem: 'datesFilterDisplayItem';
    DefaultBudgetInspectorDisplayItem: 'defaultBudgetInspectorDisplayItem';
    DropDownFilterDisplayItem: 'dropDownFilterDisplayItem';
    DropDownSelectionDisplayItem: 'dropDownSelectionDisplayItem';
    HiddenDisplayItem: 'hiddenDisplayItem';
    RegisterHeaderDisplayItem: 'registerHeaderDisplayItem';
    SpendingReportData: 'spendingReportData';
    TransactionDisplayItem: 'transactionDisplayItem';
    UserBudgetDisplayItem: 'userBudgetDisplayItem';
  };

  InternalCategories: {
    DebtPaymentMasterCategory: 'MasterCategory/__DebtPayment__';
    DeferredIncomeSubCategory: 'Category/__DeferredIncome__';
    HiddenMasterCategory: 'MasterCategory/__Hidden__';
    ImmediateIncomeSubCategory: 'Category/__ImmediateIncome__';
    InternalMasterCategory: 'MasterCategory/__Internal__';
    PseudoMasterCategoryPinned: 'PseudoMasterCategory/__Pinned__';
    SplitSubCategory: 'Category/__Split__';
    UncategorizedPseudoCategory: '__uncategorized__';
    UncategorizedSubCategory: 'Category/__None__';
  };

  PayeeRenameConditionOperator: {
    Contains: 'Contains';
    EndsWith: 'EndsWith';
    Is: 'Is';
    StartsWith: 'StartsWith';
  };

  RouteNames: {
    AccountsIndex: 'accounts.index';
    AccountsSelect: 'accounts.select';
    BudgetIndex: 'budget.index';
    BudgetPicker: 'users.budgets';
    BudgetSelect: 'budget.select';
    ReportSpending: 'reports.spending';
    ReportNetWorth: 'reports.net-worth';
    ReportIncomeExpense: 'reports.income-expense';
  };

  SubCategoryGoalType: {
    DebtPayment: 'DEBT';
    MonthlyFunding: 'MF';
    Needed: 'NEED';
    TargetBalance: 'TB';
    TargetBalanceOnDate: 'TBD';
  };

  TransactionDisplayItemType: {
    ImportedMatchedTransaction: 'importedMatchedTransaction';
    ImportedTransaction: 'importedTransaction';
    PendingTransaction: 'pendingTransaction';
    ScheduledSubTransaction: 'scheduledSubTransaction';
    ScheduledTransaction: 'scheduledTransaction';
    SubTransaction: 'subTransaction';
    Transaction: 'transaction';
  };

  TransactionSource: {
    Imported: 'Imported';
    ImportedPending: 'ImportedPending';
    Matched: 'Matched';
    MatchedImport: 'matched_import';
    MatchedPending: 'matched_pending';
    None: null;
    Pending: 'Pending';
    RawImport: 'raw_import';
    RawPending: 'raw_pending';
    Scheduler: 'Scheduler';
  };

  TransactionState: {
    Cleared: 'Cleared';
    Reconciled: 'Reconciled';
    Uncleared: 'Uncleared';
  };

  ViewModelType: {
    AccountViewModel: 'account';
    AllAccountsViewModel: 'allAccount';
    AllBudgetMonthsViewModel: 'allBudgetMonths';
    BudgetMonthViewModel: 'budgetMonth';
    CategoriesViewModel: 'categories';
    PayeesViewModel: 'payees';
    ReportsIncomeExpenseViewModel: 'reportsIncomeExpense';
    ReportsNetWorthViewModel: 'reportsNetWorth';
    ReportsSpendingViewModel: 'reportsSpending';
    SettingsViewModel: 'settings';
    SidebarViewModel: 'sidebar';
    UserViewModel: 'user';
  };
}
