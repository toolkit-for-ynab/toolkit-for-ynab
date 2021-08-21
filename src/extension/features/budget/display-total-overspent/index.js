import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';

export class DisplayTotalOverspent extends Feature {
  shouldInvoke() {
    return true;
  }

  invoke() {
    addToolkitEmberHook(this, 'budget/budget-inspector', 'didRender', this.addTotalOverspent);
  }

  destroy() {
    $('.tk-display-total-overspent').remove();
  }

  addTotalOverspent() {
    let overspentTotal = 0;
    let overspentChecked = 0;
    let checkedCount = 0;

    $('.budget-table-row.is-sub-category').each((_, element) => {
      const category = getEmberView(element.id, 'category');
      if (!category) {
        return;
      }

      const { monthlySubCategoryBudgetCalculation } = category;
      if (monthlySubCategoryBudgetCalculation) {
        overspentTotal += Math.min(monthlySubCategoryBudgetCalculation.balance, 0);

        if (category.isChecked) {
          overspentChecked += Math.min(monthlySubCategoryBudgetCalculation.balance, 0);
          checkedCount++;
        }
      }
    });

    const displayOverspent = checkedCount > 0 ? overspentChecked : overspentTotal;
    const currencyClass = displayOverspent === 0 ? 'zero' : 'negative';

    $('.tk-display-total-overspent').remove();
    $('.ynab-breakdown').append(`
      <div class="tk-display-total-overspent">
        <div>Overspending</div>
        <div class="user-data">
          <span class="user-data currency ${currencyClass}">
            ${formatCurrency(displayOverspent)}
          </span>
        </div>
      </div>
    `);
  }
}
