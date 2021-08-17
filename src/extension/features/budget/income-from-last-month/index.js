import { Feature } from 'toolkit/extension/features/feature';
import {
  isCurrentRouteBudgetPage,
  getCurrentBudgetDate,
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

    // Get short name for current and income months
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
            }),
            $('<div>', {
              class: 'toolkit-income-from-last-month-assigned',
            })
          )
        )
      );
    }

    // Create income line
    const incomeContents = `<div>${l10n(
      'toolkit.incomeIn',
      'Income in'
    )} ${incomeMonthName}</div><div class="user-data"><span class="user-data currency positive">${formatCurrency(
      incomeBudgetCalculation.immediateIncome
    )}</span></div>`;

    // Create assigned line
    const assignedContents = `<div>${l10n(
      'toolkit.assignedIn',
      'Assigned in'
    )} ${currentMonthName}</div><div class="user-data"><span class="user-data currency positive">${formatCurrency(
      currentBudgetCalculation.budgeted
    )}</span></div>`;

    // Insert income from last month lines
    $('.toolkit-income-from-last-month-income').html(incomeContents);
    $('.toolkit-income-from-last-month-assigned').html(assignedContents);
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
