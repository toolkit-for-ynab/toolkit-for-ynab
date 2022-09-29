interface YNABBudgetService {
  budgetHeaderValues: {
    monthlyBudget: {
      month: {
        format: (input: string) => string;
      };
    };
    monthString: string;
  };
}
