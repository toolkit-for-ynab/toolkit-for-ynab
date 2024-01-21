import { YNABBudgetMonthDisplayItem } from '../services/YNABBudgetService';

export interface BudgetTableRowComponent extends EmberView {
  category: YNABBudgetMonthDisplayItem;
}
