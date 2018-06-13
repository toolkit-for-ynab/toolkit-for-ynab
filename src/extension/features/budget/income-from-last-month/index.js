import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage, getSelectedMonth, getEntityManager } from 'toolkit/extension/utils/ynab';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { l10n, l10nMonth, MonthStyle } from 'toolkit/extension/utils/toolkit';

export class IncomeFromLastMonth extends Feature {
  injectCSS() { return require('./index.css'); }

  shouldInvoke() { return isCurrentRouteBudgetPage(); }

  invoke() {
    // Do nothing if no header found.
    if ($('.budget-header-totals-details-values').length === 0) return;
    const matchMonth = getSelectedMonth().subtractMonths(this.settings.enabled);
    const previousMonthName = l10nMonth(matchMonth.getMonth(), MonthStyle.Short);

    const total = getEntityManager().getAllTransactions().reduce((reduced, transaction) => {
      if (transaction.getIsSplit()) {
        transaction.getSubTransactions().forEach((subTransaction) => {
          if (subTransaction.get('subCategory') && subTransaction.get('subCategory').isIncomeCategory()) {
            reduced += subTransaction.get('amount');
          }
        });
      } else if (
        !transaction.get('isTombstone') &&
        !transaction.isTransferTransaction() &&
        transaction.get('account.onBudget') &&
        (transaction.get('date') && transaction.get('date').equalsByMonth(matchMonth)) &&
        (transaction.get('subCategory') && transaction.get('subCategory').isIncomeCategory())
      ) {
        reduced += transaction.get('amount');
      }

      return reduced;
    }, 0);

    if ($('.toolkit-income-from-last-month').length === 0) {
      $('.budget-header-totals-details-values')
        .prepend($('<div>', {
          class: 'budget-header-totals-cell-value toolkit-income-from-last-month user-data'
        }).append('<span>', {
          class: 'user-data currency positive'
        }));

      $('.budget-header-totals-details-names')
        .prepend($('<div>', {
          class: 'budget-header-totals-cell-name toolkit-income-from-last-month',
          css: {
            'padding-left': '0.3em',
            'text-align': 'left'
          }
        }));
    }

    $('.budget-header-totals-cell-value.toolkit-income-from-last-month span')
      .text(formatCurrency(total));

    $('.budget-header-totals-details-names > .toolkit-income-from-last-month')
      .text(`${l10n('toolkit.incomeIn', 'Income in')} ${previousMonthName}`);
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    // User has returned back to the budget screen
    // User switch budget month
    if (changedNodes.has('budget-header-flexbox') ||
        changedNodes.has('budget-table') ||
        changedNodes.has('layout user-logged-in')) {
      this.invoke();
    }
  }
}
