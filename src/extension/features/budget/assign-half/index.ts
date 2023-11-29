import { Feature } from 'toolkit/extension/features/feature';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getBudgetService, getEntityManager } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';

// The concept here is that for odd amounts there is a low half and a high half.
// Example:  For $65.05 the low half is $32.52 (x2 = $65.04).  The high half is $35.53 (x2 - $65.06). 
enum HalfType {
  Exact = "Exact",
  Low = "Low",
  High = "High"
}

interface BudgetCategoryAmount {
  budgetCategoryId: string;
  amount: number;
}

export class AssignHalf extends Feature {
  private lowHalf: BudgetCategoryAmount[] = [];
  private highHalf: BudgetCategoryAmount[] = [];

  shouldInvoke() {
    return true;
  }

  invoke() {
    //console.log('AssignHalf is working!');
  }

  halfAssignButton(text: string, amount: number, halfType: HalfType) {
    const formattedAmount = formatCurrency(amount, true);
    return $(`
    <button class="budget-inspector-button assign-half" type="button" data-half-type="${HalfType[halfType]}">
        <div>${text}</div>
        <div>
            <strong class="user-data" title="${formattedAmount}">
                <span class="user-data currency positive">
                    <bdi>$</bdi>${formattedAmount}</span>
            </strong>
        </div>
    </button>`);
  }

  observe(changedNodes: Set<string>) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('budget-inspector-button')) {
      this.updateDOM();
    }
  }

  updateDOM() {
    if (!$('.budget-inspector').length) return;
    if (!$('.inspector-quick-budget').length) return;
    if ($('.budget-inspector-button.assign-half').length) return;    

    //debugger
    const selectedBudgetCategories = this._getSelectedBudgetCategories();
    if (selectedBudgetCategories != null) {
      const underfundedButtonText = $($(".inspector-quick-budget .option-groups > div")[0]).find("button div:contains('Underfunded')");
      const underfundedButton = $(underfundedButtonText).parent();
  
      this.lowHalf = this._getSelectedCategoriesAssignmentAmounts(selectedBudgetCategories, HalfType.Low);
      this.highHalf = this._getSelectedCategoriesAssignmentAmounts(selectedBudgetCategories, HalfType.High);

      let lowHalfSum: number = 0;
      this.lowHalf.forEach(a => lowHalfSum += a.amount);

      let highHalfSum: number = 0;
      this.highHalf.forEach(a => highHalfSum += a.amount);

    if (lowHalfSum === highHalfSum) {
        // We only need one button.  This may be a case where all selected budget category's underfunded amounts were even numbers.  
        // Or the case where there are multiple odd amounts that equalized the amounts.
        $(underfundedButton).parent().append(this.halfAssignButton("Assign Half", lowHalfSum, HalfType.Exact));
      } else {
        $(underfundedButton).parent().append(this.halfAssignButton("Assign Low Half", lowHalfSum, HalfType.Low));

        $(underfundedButton).parent().append(this.halfAssignButton("Assign High Half", highHalfSum, HalfType.High));
      }
    }

    $("button.budget-inspector-button.assign-half").on("mousedown", event => {
      //$(event.target).prop('disabled', true)
      const halfTypeString = event.delegateTarget.attributes.getNamedItem("data-half-type")!.value;

      // This will treat HalfType Exact like Low.
      const selectedBudgetCategories = halfTypeString.valueOf() !== HalfType.High ? this.lowHalf : this.highHalf;

      selectedBudgetCategories.forEach(selectedBudgetCategory => {
        this._assignAmountToBudgetCategory(selectedBudgetCategory.budgetCategoryId, selectedBudgetCategory.amount);
      })
    })
  }

  _getSelectedCategoriesAssignmentAmounts(selectedBudgetCategories: YNABBudgetMonthDisplayItem[], halfType: HalfType): BudgetCategoryAmount[] {
    const selectedBudgetCategoryAmounts: BudgetCategoryAmount[] = []
    selectedBudgetCategories.forEach(selectedBudgetCategory => {

      const budgeCategoryAmount: BudgetCategoryAmount = {
        budgetCategoryId: selectedBudgetCategory.categoryId,
        amount: this._getHalfAmount(selectedBudgetCategory.underfundedAmount, halfType)
      }

      selectedBudgetCategoryAmounts.push(budgeCategoryAmount);
    })

    return selectedBudgetCategoryAmounts;
  }

  _getSelectedBudgetCategories = () => {
    const budgetService = getBudgetService()
    if (budgetService !== undefined && budgetService != null && budgetService.checkedRowsCount > 0) {
      return budgetService.checkedRows;
    }

    return null;
  }

  _getHalfAmount = (amount: number, halfType: HalfType) => {
    amount = amount/10
    if (amount & 1) {
      const someHalf = (+(amount / 2).toFixed(0));
      const otherHalf = (amount - someHalf);
      if (halfType === HalfType.Low) {
        return Math.min(someHalf * 10, otherHalf * 10);
      } else {
        return Math.max(someHalf * 10, otherHalf * 10);
      }
    } else {
      return (amount / 2) * 10;
    }
  }

  _assignAmountToBudgetCategory(budgetRowId: string, amount: number) {
    const budgetRow = document.querySelector(`[data-entity-id="${budgetRowId}"]`);
    const emberView = getEmberView<BudgetTableRowComponent>(budgetRow?.id);
    if (emberView) {
      emberView.category.budgeted += amount;
    }
  }
}