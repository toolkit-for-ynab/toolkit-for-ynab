import debounce from 'debounce';
import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentMonthSelected } from 'toolkit/extension/utils/ynab';
import {
  getDeemphasizedCategories,
  pacingForCategory,
  setDeemphasizedCategories,
} from 'toolkit/extension/utils/pacing';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { l10n } from 'toolkit/extension/utils/toolkit';
import {
  budgetRowInChangesSet,
  getBudgetMonthDisplaySubCategory,
} from 'toolkit/extension/features/budget/utils';

export class Pacing extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  destroy() {
    $('.tk-budget-table-cell-pacing').remove();
  }

  invoke() {
    const pacingCells = $('.tk-budget-table-cell-pacing');

    if (!isCurrentMonthSelected()) {
      pacingCells.remove();
      return;
    }

    const budgetRows = $('.js-budget-table-row');
    const budgetRowsWithoutPacing = budgetRows.filter(
      (_, el) => !el.querySelector('.tk-budget-table-cell-pacing')
    );
    const nBudgetRowsWithoutPacing = budgetRowsWithoutPacing.length;

    const shouldReRenderPacing = pacingCells.length === 0 || nBudgetRowsWithoutPacing > 0;

    if (!shouldReRenderPacing) {
      return;
    }

    this.ensureHeader();

    budgetRowsWithoutPacing.each((_, el) => {
      this.addPacing(el);
    });
  }

  debouncedInvoke = debounce(this.invoke, 100);

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (budgetRowInChangesSet(changedNodes)) {
      this.debouncedInvoke();
    }
  }

  ensureHeader() {
    if (!$('.budget-table-header .tk-budget-table-cell-pacing').length) {
      $('.budget-table-header .budget-table-cell-available').after(
        `<div class="tk-budget-table-cell-pacing">${l10n('toolkit.pacing', 'PACING')}</div>`
      );
    }
  }

  addPacing(element) {
    if (element.classList.contains('is-master-category')) {
      if (!element.querySelector('.tk-budget-table-cell-pacing')) {
        $('.budget-table-cell-available', element).after(
          `<div class="tk-budget-table-cell-pacing"></div>`
        );
      }

      return;
    }

    if (element.classList.contains('is-debt-payment-category')) {
      if (!element.querySelector('.tk-budget-table-cell-pacing')) {
        $('.budget-table-cell-available', element).after(
          `<div class="tk-budget-table-cell-pacing"></div>`
        );
      }

      return;
    }

    const category = getBudgetMonthDisplaySubCategory(element.dataset.entityId);
    if (!category) {
      return;
    }

    const pacingCalculation = pacingForCategory(category);

    const $display = this.generateDisplay(category?.subCategory?.entityId, pacingCalculation);
    const $button = $display.find('button');
    $button.on('click', (event) => {
      const deemphasizedCategories = getDeemphasizedCategories();
      const subCategoryId = event.currentTarget.getAttribute('data-tk-sub-category-id');

      if (deemphasizedCategories.contains(subCategoryId)) {
        $button.removeClass('deemphasized');
        setDeemphasizedCategories(
          deemphasizedCategories.filter((id) => {
            return id !== subCategoryId;
          })
        );
      } else {
        $button.addClass('deemphasized');
        deemphasizedCategories.push(subCategoryId);
        setDeemphasizedCategories(deemphasizedCategories);
      }

      if (['pacing', 'both'].indexOf(ynabToolKit.options.BudgetProgressBars) !== -1) {
        ynabToolKit.invokeFeature('BudgetProgressBars');
      }

      event.stopPropagation();
    });

    if ($('.tk-budget-table-cell-pacing', element).length) {
      $('.tk-budget-table-cell-pacing', element).remove();
    }

    $('.budget-table-cell-available', element).after($display);
  }

  generateDisplay(subCategoryId, pacingCalculation) {
    const { budgetedPace, daysOffTarget, isDeemphasized, monthPace, paceAmount } =
      pacingCalculation;
    const deemphasizedClass = isDeemphasized ? 'deemphasized' : '';
    const indicatorClass = this.settings.enabled === '2' ? 'indicator' : '';
    const temperatureClass = budgetedPace / monthPace > 1 ? 'cautious' : 'positive';
    const tooltip = this.generateTooltip(pacingCalculation);

    const $display = $(`
      <div class="tk-budget-table-cell-pacing budget-table-row-li budget-table-cell-available">
        <button
          title="${tooltip}"
          data-tk-sub-category-id="${subCategoryId}"
          class="ynab-new-budget-available-number currency ${temperatureClass} ${deemphasizedClass} ${indicatorClass}"
        ><span class="tk-pacing-number currency ${temperatureClass}"></span></button>
      </div>
    `);

    const daysFormat = Math.abs(daysOffTarget) === 1 ? 'day' : 'days';
    switch (this.settings.enabled) {
      case '1':
      case '2':
        $('.tk-pacing-number', $display).text(formatCurrency(paceAmount));
        break;
      case '3':
        $('.tk-pacing-number', $display).text(`${daysOffTarget} ${daysFormat}`);
        break;
    }

    return $display;
  }

  generateTooltip(pacingCalculation) {
    const { daysOffTarget, isDeemphasized, monthPace, paceAmount, transactions } =
      pacingCalculation;

    const moreOrLess = paceAmount >= 0 ? 'less' : 'more';
    const aheadOrBehind = paceAmount >= 0 ? 'ahead of' : 'behind';
    const hideOrUnhide = isDeemphasized ? 'unhide' : 'hide';
    const formattedDisplay = formatCurrency(Math.abs(paceAmount), false);
    const formattedDisplayInDays = Math.abs(daysOffTarget);
    const days = formattedDisplayInDays === 1 ? 'day' : 'days';
    const transactionsFormat = transactions.length === 1 ? 'transaction' : 'transactions';
    const percentOfMonth = Math.round(monthPace * 100);
    const trimWords = (paragraph) => paragraph.replace(/\s+/g, ' ').trim();

    return trimWords(`
      In ${transactions.length} ${transactionsFormat}, you have spent ${formattedDisplay} ${moreOrLess} than
      your available budget for this category ${percentOfMonth}% of the way through the month.
      You are ${formattedDisplayInDays} ${days} ${aheadOrBehind} schedule.
      &#13;&#13;Click to ${hideOrUnhide}.
    `);
  }
}
