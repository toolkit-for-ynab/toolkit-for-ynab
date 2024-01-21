import type { EmberView } from '../ember/ember-view';
import type { YNABBudgetMonthDisplayItem } from '../services/YNABBudgetService';

export interface BudgetTableRowComponent extends EmberView {
  category: YNABBudgetMonthDisplayItem;
}
