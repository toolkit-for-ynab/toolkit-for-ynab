import { Feature } from 'toolkit/extension/features/feature';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { getBudgetService, isCurrentMonthSelected } from 'toolkit/extension/utils/ynab';
import type { YNABBudgetMonthDisplayItem } from 'toolkit/types/ynab/services/YNABBudgetService';

// The concept here is that for odd monthly Target amounts there is a low half and a high half.
// Example:  For $65.05 the low half is $32.52 (x2 = $65.04).  The high half is $32.53 (x2 - $65.06).
enum HalfType {
  Exact = 'Exact',
  Low = 'Low',
  High = 'High',
}

interface BudgetCategoryAmount {
  budgetCategoryId: string;
  amount: number;
}

export class FundHalf extends Feature {
  private lowHalf: BudgetCategoryAmount[] = [];
  private highHalf: BudgetCategoryAmount[] = [];

  shouldInvoke() {
    return true;
  }

  invoke() {}

  halfFundButton(text: string, amount: number, halfType: HalfType) {
    const formattedAmount = formatCurrency(amount, true);
    return $(`
    <button class="budget-inspector-button fund-half" type="button" data-half-type="${HalfType[halfType]}">
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
    // if (!isCurrentMonthSelected()) return;
    if (!$('.budget-inspector').length) return;
    if (!$('.inspector-quick-budget').length) return;
    if ($('.budget-inspector-button.fund-half').length) return;

    const selectedBudgetCategories = this._getSelectedBudgetCategories();
    if (selectedBudgetCategories != null) {
      const underfundedButtonText = $('.inspector-quick-budget .option-groups > div')
        .eq(0)
        .find("button div:contains('Underfunded')");
      const underfundedButton = underfundedButtonText.parent();

      this.lowHalf = this._getSelectedCategoriesFundAmounts(selectedBudgetCategories, HalfType.Low);
      this.highHalf = this._getSelectedCategoriesFundAmounts(
        selectedBudgetCategories,
        HalfType.High
      );

      let lowHalfSum: number = 0;
      this.lowHalf.forEach((a) => (lowHalfSum += a.amount));

      let highHalfSum: number = 0;
      this.highHalf.forEach((a) => (highHalfSum += a.amount));

      if (lowHalfSum === highHalfSum) {
        // We only need one button.  This may be a case where all selected budget category's Target amounts were even numbers.
        // Or the case where there are multiple odd amounts that equalized the amounts.
        underfundedButton
          .parent()
          .append(this.halfFundButton('Fund Half', lowHalfSum, HalfType.Exact));
      } else {
        underfundedButton
          .parent()
          .append(this.halfFundButton('Fund Low Half', lowHalfSum, HalfType.Low));

        underfundedButton
          .parent()
          .append(this.halfFundButton('Fund High Half', highHalfSum, HalfType.High));
      }
    }

    $('button.budget-inspector-button.fund-half').on('mousedown', (event) => {
      const halfTypeString = event.delegateTarget.attributes.getNamedItem('data-half-type')!.value;

      // This will treat HalfType Exact like Low.
      const selectedBudgetCategories =
        halfTypeString.valueOf() !== HalfType.High ? this.lowHalf : this.highHalf;

      selectedBudgetCategories.forEach((selectedBudgetCategory) => {
        this._fundAmountToBudgetCategory(
          selectedBudgetCategory.budgetCategoryId,
          selectedBudgetCategory.amount
        );
      });
    });
  }

  _getSelectedCategoriesFundAmounts(
    selectedBudgetCategories: YNABBudgetMonthDisplayItem[],
    halfType: HalfType
  ): BudgetCategoryAmount[] {
    const selectedBudgetCategoryAmounts: BudgetCategoryAmount[] = [];
    selectedBudgetCategories.forEach((selectedBudgetCategory) => {
      const budgeCategoryAmount: BudgetCategoryAmount = {
        budgetCategoryId: selectedBudgetCategory.categoryId,
        amount: this._getHalfAmount(selectedBudgetCategory.goalTarget, halfType),
      };

      selectedBudgetCategoryAmounts.push(budgeCategoryAmount);
    });

    return selectedBudgetCategoryAmounts;
  }

  _getSelectedBudgetCategories = () => {
    const budgetService = getBudgetService();
    if (
      budgetService !== undefined &&
      budgetService != null &&
      budgetService.checkedRowsCount > 0
    ) {
      return budgetService.checkedRows;
    }

    return null;
  };

  _getHalfAmount = (amount: number, halfType: HalfType) => {
    amount = amount / 10;
    if (amount % 2 === 1) {
      //  If the amount is odd?
      const someHalf = +(amount / 2).toFixed(0);
      const otherHalf = amount - someHalf;
      if (halfType === HalfType.Low) {
        return Math.min(someHalf * 10, otherHalf * 10);
      } else {
        return Math.max(someHalf * 10, otherHalf * 10);
      }
    } else {
      //  Amount is even so just divide it in half.
      return (amount / 2) * 10;
    }
  };

  _fundAmountToBudgetCategory(budgetRowId: string, amount: number) {
    const budgetService = getBudgetService();
    if (
      budgetService !== undefined &&
      budgetService != null &&
      budgetService.checkedRowsCount > 0
    ) {
      const checkedRows = budgetService.checkedRows;
      if (Array.isArray(checkedRows)) {
        const categoryRow = checkedRows.find((row) => row.categoryId === budgetRowId);
        if (categoryRow) {
          categoryRow.budgeted += amount;
        }
      }
    }
  }
}
