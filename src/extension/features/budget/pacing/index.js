import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage, isCurrentMonthSelected } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import {
  getDeemphasizedCategories,
  migrateLegacyPacingStorage,
  pacingForCategory,
  setDeemphasizedCategories,
} from 'toolkit/extension/utils/pacing';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { l10n } from 'toolkit/extension/utils/toolkit';

export class Pacing extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  willInvoke() {
    migrateLegacyPacingStorage();
  }

  shouldInvoke() {
    return isCurrentRouteBudgetPage() && isCurrentMonthSelected();
  }

  invoke() {
    $('#ynab-toolkit-pacing-style').remove();
    $('.budget-table-header .budget-table-cell-available').after(`<li class="toolkit-cell-pacing">
        ${l10n('toolkit.pacing', 'PACING')}
      </li>`);

    $(`<style type="text/css" id="ynab-toolkit-pacing-style">
      .budget-table-cell-available {
        width: 10% !important;
      }
    </style>`).appendTo('head');

    $('.budget-table-row')
      .not('.budget-table-uncategorized-transactions')
      .not('.is-debt-payment-category')
      .not('.is-master-category')
      .each((index, element) => {
        const category = getEmberView(element.id, 'category');
        if (!category) {
          return;
        }

        const pacingCalculation = pacingForCategory(category);

        const $display = this.generateDisplay(
          category.get('subCategory.entityId'),
          pacingCalculation
        );
        $(element).append(
          $display.click(event => {
            const deemphasizedCategories = getDeemphasizedCategories();
            const subCategoryId = event.target.getAttribute('data-sub-category-id');

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

  onBudgetChanged() {
    this.willInvoke();
    this.onRouteChanged();
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    } else {
      this.cleanup();
    }
  }

  cleanup() {
    $('#ynab-toolkit-pacing-style').remove();
    $(
      '<style type="text/css" id="ynab-toolkit-pacing-style"> .toolkit-cell-pacing { display: none; } </style>'
    ).appendTo('head');
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
      <li class="budget-table-cell-available toolkit-cell-pacing">
        <span
          title="${tooltip}"
          class="toolkit-cell-pacing-display currency ${temperatureClass} ${deemphasizedClass} ${indicatorClass}"
          data-sub-category-id="${subCategoryId}"
        />
      </li>
    `);

    const daysFormat = Math.abs(daysOffTarget) === 1 ? 'day' : 'days';
    switch (this.settings.enabled) {
      case '1':
      case '2':
        $('.toolkit-cell-pacing-display', $display).text(formatCurrency(paceAmount));
        break;
      case '3':
        $('.toolkit-cell-pacing-display', $display).text(`${daysOffTarget} ${daysFormat}`);
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
      In ${
        transactions.length
      } ${transactionsFormat}, you have spent ${formattedDisplay} ${moreOrLess} than
      your available budget for this category ${percentOfMonth}% of the way through the month.
      You are ${formattedDisplayInDays} ${days} ${aheadOrBehind} schedule.
      &#13;&#13;Click to ${hideOrUnhide}.
    `);
  }
}
