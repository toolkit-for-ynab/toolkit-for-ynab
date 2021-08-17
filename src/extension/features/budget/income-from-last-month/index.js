import { Feature } from 'toolkit/extension/features/feature';
import {
  isCurrentRouteBudgetPage,
  getSelectedMonth,
  getEntityManager,
} from 'toolkit/extension/utils/ynab';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { l10n, l10nMonth, MonthStyle } from 'toolkit/extension/utils/toolkit';

export class IncomeFromLastMonth extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    // Do nothing if no header found.
    if ($('.budget-header-totals').length === 0) return;
    // Get current month and adjust per settings for which month to use for 'last month'
    const matchMonth = getSelectedMonth().subtractMonths(this.settings.enabled);
    const previousMonthName = l10nMonth(matchMonth.getMonth(), MonthStyle.Short);
    const currentMonthName = l10nMonth(getSelectedMonth().getMonth(), MonthStyle.Short);

    // Calculate income from 'last month'
    const total = getEntityManager()
      .getAllTransactions()
      .reduce((reduced, transaction) => {
        // Extract details for transaction
        const isSplit = transaction.getIsSplit();
        const transactionSubCategory = transaction.get('subCategory');
        const transactionAmount = transaction.get('amount');

        // Check if transaction is from the appropriate month.
        if (
          !transaction.get('date').equalsByMonth(matchMonth) ||
          transaction.get('isTombstone') ||
          !transactionSubCategory
        ) {
          return reduced;
        }

        // Add to total if the transaction is income, but not if it is split
        if (transactionSubCategory.isImmediateIncomeCategory()) {
          return reduced + transactionAmount;
        }
        // Add income portion to total if it is a split transaction
        if (isSplit) {
          let subTransactionIncomes = 0;
          transaction.get('subTransactions').forEach((subTransaction) => {
            const subTransactionSubCategory = subTransaction.get('subCategory');
            const subTransactionAmount = subTransaction.get('amount');

            if (!subTransactionSubCategory) {
              return;
            }

            if (subTransactionSubCategory.isImmediateIncomeCategory()) {
              subTransactionIncomes += subTransactionAmount;
            }
          });

          return reduced + subTransactionIncomes;
        }

        return reduced;
      }, 0);

    // Add the income from last month section and structure, if not already in place
    if ($('.toolkit-income-from-last-month').length === 0) {
      $('.budget-header-totals').after(
        $('<div>', {
          class: 'budget-header-item budget-header-totals toolkit-income-from-last-month user-data',
        }).append(
          $('<div>', {
            id: 'toolkit-income-from-last-month-container',
            class: 'to-be-budgeted ember-view ynab-breakdown',
          }).append(
            $('<div>', {
              class: 'toolkit-income-from-last-month-income',
            })
          )
        )
      );
    }

    // Create income line
    const incomeContents = `<div>${l10n(
      'toolkit.incomeIn',
      'Income in'
    )} ${previousMonthName}</div><div class="user-data"><span class="user-data currency positive">${formatCurrency(
      total
    )}</span></div>`;

    $('.toolkit-income-from-last-month-income').html(incomeContents);
  }

  // Listen for events that require an update
  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    // User has returned back to the budget screen
    // User switch budget month
    if (
      changedNodes.has('budget-header-flexbox') ||
      changedNodes.has('budget-table') ||
      changedNodes.has('layout user-logged-in')
    ) {
      this.invoke();
    }
  }
}
