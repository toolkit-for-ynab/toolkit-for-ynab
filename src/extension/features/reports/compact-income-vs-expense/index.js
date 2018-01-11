import { Feature } from 'toolkit/extension/features/feature';
import { getCurrentRouteName } from 'toolkit/extension/utils/ynab';

export class CompactIncomeVsExpense extends Feature {
  injectCSS() { return require('./index.css'); }

  shouldInvoke() {
    return getCurrentRouteName().indexOf('reports.income-expense') > -1;
  }

  invoke() {
    let viewWidth = $('.reports-content').width();
    let columnCount = $('.income-expense-column.income-expense-column-header').length;
    let tableWidth = columnCount * 115 + 200 + 32;
    let percentage = Math.ceil(tableWidth / viewWidth * 100);

    $('.income-expense-table').css({ width: percentage + '%' });
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    if (changedNodes.has('income-expense-row') ||
        changedNodes.has('income-expense-column income-expense-number')) {
      this.invoke();
    }
  }

  onRouteChanged() {
    if (this.shouldInvoke()) {
      this.invoke();
    }
  }
}
