import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage, isCurrentMonthSelected } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import {
  getDeemphasizedCategories,
  pacingForCategory,
  setDeemphasizedCategories,
} from 'toolkit/extension/utils/pacing';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { l10n } from 'toolkit/extension/utils/toolkit';

export class Pacing extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    if (!isCurrentMonthSelected()) {
      $('.tk-budget-table-cell-pacing').remove();
      return;
    }

    if (!$('.budget-table-header .tk-budget-table-cell-pacing').length) {
      $('.budget-table-header .budget-table-cell-available').after(
        `<li class="tk-budget-table-cell-pacing">${l10n('toolkit.pacing', 'PACING')}</li>`
      );
    }

    $('.budget-table-row').each((_, element) => {
      if (element.classList.contains('is-master-category')) {
        $('.budget-table-cell-available', element).after(
          `<li class="tk-budget-table-cell-pacing"></li>`
        );

        return;
      }

      if (element.classList.contains('is-debt-payment-category')) {
        $('.budget-table-cell-available', element).after(
          `<li class="tk-budget-table-cell-pacing"></li>`
        );

        return;
      }

      const category = getEmberView(element.id, 'category');
      if (!category) {
        return;
      }

      const pacingCalculation = pacingForCategory(category);

      const $display = this.generateDisplay(
        category.get('subCategory.entityId'),
        pacingCalculation
      );

      $('.budget-table-cell-available', element).after(
        $display.click(event => {
          const deemphasizedCategories = getDeemphasizedCategories();
          const subCategoryId = event.target.getAttribute('data-tk-sub-category-id');

          if (deemphasizedCategories.contains(subCategoryId)) {
            $(event.target).removeClass('deemphasized');
            setDeemphasizedCategories(
              deemphasizedCategories.filter(id => {
                return id !== subCategoryId;
              })
            );
          } else {
            $(event.target).addClass('deemphasized');
            deemphasizedCategories.push(subCategoryId);
            setDeemphasizedCategories(deemphasizedCategories);
          }

          if (['pacing', 'both'].indexOf(ynabToolKit.options.BudgetProgressBars) !== -1) {
            ynabToolKit.invokeFeature('BudgetProgressBars');
          }

          event.stopPropagation();
        })
      );
    });
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }

  generateDisplay(subCategoryId, pacingCalculation) {
    const {
      budgetedPace,
      daysOffTarget,
      isDeemphasized,
      monthPace,
      paceAmount,
    } = pacingCalculation;
    const deemphasizedClass = isDeemphasized ? 'deemphasized' : '';
    const indicatorClass = this.settings.enabled === '2' ? 'indicator' : '';
    const temperatureClass = budgetedPace / monthPace > 1 ? 'cautious' : 'positive';
    const tooltip = this.generateTooltip(pacingCalculation);

    const $display = $(`
      <li class="tk-budget-table-cell-pacing">
        <div
          title="${tooltip}"
          data-tk-sub-category-id="${subCategoryId}"
          class="ynab-new-budget-available-number tk-pacing-number currency ${temperatureClass} ${deemphasizedClass} ${indicatorClass}"
        />
      </li>
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
    const {
      daysOffTarget,
      isDeemphasized,
      monthPace,
      paceAmount,
      transactions,
    } = pacingCalculation;

    const moreOrLess = paceAmount >= 0 ? 'less' : 'more';
    const aheadOrBehind = paceAmount >= 0 ? 'ahead of' : 'behind';
    const hideOrUnhide = isDeemphasized ? 'unhide' : 'hide';
    const formattedDisplay = formatCurrency(Math.abs(paceAmount), false);
    const formattedDisplayInDays = Math.abs(daysOffTarget);
    const days = formattedDisplayInDays === 1 ? 'day' : 'days';
    const transactionsFormat = transactions.length === 1 ? 'transaction' : 'transactions';
    const percentOfMonth = Math.round(monthPace * 100);
    const trimWords = paragraph => paragraph.replace(/\s+/g, ' ').trim();

    return trimWords(`
      In ${transactions.length} ${transactionsFormat}, you have spent ${formattedDisplay} ${moreOrLess} than
      your available budget for this category ${percentOfMonth}% of the way through the month.
      You are ${formattedDisplayInDays} ${days} ${aheadOrBehind} schedule.
      &#13;&#13;Click to ${hideOrUnhide}.
    `);
  }
}
