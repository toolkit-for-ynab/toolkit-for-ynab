interface YNABBudgetService {
  budgetHeaderValues: {
    monthlyBudget: {
      month: {
        format: (input: string) => string;
      };
    };
  };
}
