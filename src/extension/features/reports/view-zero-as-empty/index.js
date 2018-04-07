import { Feature } from 'toolkit/extension/features/feature';
import { getCurrentRouteName } from 'toolkit/extension/utils/ynab';

export class ViewZeroAsEmpty extends Feature {
  shouldInvoke() {
    return getCurrentRouteName().indexOf('reports.income-expense') !== -1;
  }

  invoke() {
    $('.user-data.zero').empty();
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
