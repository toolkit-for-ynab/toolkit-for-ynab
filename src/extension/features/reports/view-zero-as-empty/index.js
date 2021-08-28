import { Feature } from 'toolkit/extension/features/feature';
import { getCurrentRouteName } from 'toolkit/extension/utils/ynab';

export class ViewZeroAsEmpty extends Feature {
  shouldInvoke() {
    return getCurrentRouteName().indexOf('reports.income-expense') !== -1;
  }

  destroy() {
    $('.income-expense-level2 .user-data.zero').removeClass('tk-hidden');
  }

  invoke() {
    $('.income-expense-level2 .user-data.zero').addClass('tk-hidden');
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;

    this.invoke();
  }
}
