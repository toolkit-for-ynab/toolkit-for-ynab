import { Feature } from 'toolkit/extension/features/feature';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { componentLookup } from 'toolkit/extension/utils/ember';

export class StealingFromFuture extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    // this.addToolkitEmberHook('budget-header', 'didRender', this.updateReadyToAssign);
  }

  destroy() {
    $('#tk-stealing-from-future').remove();
  }

  updateReadyToAssign(header) {
    $('#tk-stealing-from-future').remove();

    const budgetBreakdown = componentLookup('budget-breakdown');
    if (!budgetBreakdown) return;

    if (document.querySelector('.to-be-budgeted.is-negative')) {
      return;
    }

    const { negativeFutureBudgetedMonth } = budgetBreakdown;
    if (negativeFutureBudgetedMonth) {
      $('.budget-header-totals', header).after(
        $('<div>', {
          id: 'tk-stealing-from-future',
          class: 'budget-header-item budget-header-totals tk-stealing-from-future',
        }).append(
          $('<div>', { class: 'to-be-budgeted is-negative' }).append(
            $('<button>')
              .append(
                $('<div>', {
                  class: 'to-be-budgeted-amount',
                  text: formatCurrency(negativeFutureBudgetedMonth.available),
                })
              )
              .append(
                $('<div>', {
                  class: 'to-be-budgeted-label',
                  text: negativeFutureBudgetedMonth.availableLabel,
                })
              )
          )
        )
      );
    }
  }
}
