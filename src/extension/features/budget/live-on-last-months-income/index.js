import { Feature } from 'toolkit/extension/features/feature';
import {
  getCurrentBudgetDate,
  getEntityManager,
  isCurrentRouteBudgetPage,
} from 'toolkit/extension/utils/ynab';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { l10n, l10nMonth, MonthStyle } from 'toolkit/extension/utils/toolkit';

export class LiveOnLastMonthsIncome extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    this.onElement('.budget-breakdown', this.injectLastMonthsIncome);
  }

  observe() {
    this.onElement('.budget-breakdown', this.injectLastMonthsIncome);
  }

  destroy() {
    document.querySelector('#tk-last-months-income')?.remove();
  }

  injectLastMonthsIncome(element) {
    // Get current month and year
    const currentBudgetDate = getCurrentBudgetDate();
    const currentYear = parseInt(currentBudgetDate.year);
    const currentMonth = parseInt(currentBudgetDate.month);

    // Calculate income month and year based on settings
    // Adjust year/month when it rolls over
    const incomeYear = currentMonth - this.settings.enabled > 0 ? currentYear : currentYear - 1;
    const incomeMonth =
      currentMonth - this.settings.enabled > 0
        ? currentMonth - this.settings.enabled
        : currentMonth - this.settings.enabled + 12;

    const currentMonthName = l10nMonth(currentMonth - 1, MonthStyle.Short);
    const incomeMonthName = l10nMonth(incomeMonth - 1, MonthStyle.Short);

    // Get all budget calculations from YNAB
    const allBudgetCalculations = getEntityManager().getAllMonthlyBudgetCalculations();

    // Find current month budget calculations
    const currentBudgetCalculation = allBudgetCalculations.filter((budgetItem) => {
      const budgetItemDate = budgetItem.monthlyBudgetId.split('/')[1].split('-');
      return (
        currentYear === parseInt(budgetItemDate[0]) && currentMonth === parseInt(budgetItemDate[1])
      );
    })[0];

    // Find income month budget calculations
    const incomeBudgetCalculation = allBudgetCalculations.filter((budgetItem) => {
      const budgetItemDate = budgetItem.monthlyBudgetId.split('/')[1].split('-');
      return (
        incomeYear === parseInt(budgetItemDate[0]) && incomeMonth === parseInt(budgetItemDate[1])
      );
    })[0];

    // Add the income from last month section and structure, if not already in place
    if ($('#tk-last-months-income').length === 0) {
      $('.budget-breakdown-monthly-totals', element).after(
        $('<section>', {
          class: 'card',
          id: 'tk-last-months-income',
        })
          .append($('<div>', { class: 'card-roll-up' }).text("Live on Last Month's Income"))
          .append(
            $('<div>', {
              class: 'card-body',
            }).append(
              $('<div>', {
                class: 'ynab-breakdown',
              })
                .append(
                  $('<div>', { id: 'tk-income-in-month' })
                    .append($('<div>', { class: 'tk-title' }))
                    .append($('<div>', { class: 'tk-value currency' }))
                )
                .append(
                  $('<div>', { id: 'tk-assigned-in-month' })
                    .append($('<div>', { class: 'tk-title' }))
                    .append($('<div>', { class: 'tk-value currency' }))
                )
                .append(
                  $('<div>', { id: 'tk-variance-in-month' })
                    .append($('<div>').text(l10n('toolkit.varianceIn', 'Variance')))
                    .append($('<div>', { class: 'tk-value currency' }))
                )
            )
          )
      );
    }

    const income = incomeBudgetCalculation?.immediateIncome || 0;
    const budgeted = currentBudgetCalculation?.budgeted || 0;

    const lastMonthTitleText = `${l10n('toolkit.incomeIn', 'Income In')} ${incomeMonthName}`;
    const $lastMonthTitle = $('#tk-income-in-month .tk-title', element);
    if ($lastMonthTitle.text() !== lastMonthTitleText) {
      $lastMonthTitle.text(lastMonthTitleText);
    }

    const lastMonthValueText = formatCurrency(income);
    const $lastMonthValue = $('#tk-income-in-month .tk-value', element);
    if ($lastMonthValue.text() !== lastMonthValueText) {
      $lastMonthValue.text(lastMonthValueText);
    }

    const assignedInTitleText = `${l10n('toolkit.assignedIn', 'Assigned in')} ${currentMonthName}`;
    const $assignedInTitle = $('#tk-assigned-in-month .tk-title', element);
    if ($assignedInTitle.text() !== assignedInTitleText) {
      $assignedInTitle.text(assignedInTitleText);
    }

    const assignedInValueText = formatCurrency(budgeted);
    const $assignedInValue = $('#tk-assigned-in-month .tk-value', element);
    if ($assignedInValue.text() !== assignedInValueText) {
      $assignedInValue.text(assignedInValueText);
    }

    const varianceValueText = formatCurrency(income - budgeted);
    const $varianceValue = $('#tk-variance-in-month .tk-value', element);
    if ($varianceValue.text() !== varianceValueText) {
      $varianceValue.text(varianceValueText);
    }
  }
}
