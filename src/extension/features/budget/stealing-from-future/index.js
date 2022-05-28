import { Feature } from 'toolkit/extension/features/feature';
import { formatCurrency } from 'toolkit/extension/utils/currency';
import { componentLookup } from 'toolkit/extension/utils/ember';

export class StealingFromFuture extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  invoke() {
    this.onElement('.budget-header', this.updateReadyToAssign);
  }

  observe() {
    this.onElement('.budget-header', this.updateReadyToAssign);
  }

  onRouteChanged() {
    this.onElement('.budget-header', this.updateReadyToAssign);
  }

  updateReadyToAssign(header) {
    const currentAmount = $('#tk-stealing-from-future .to-be-budgeted-amount').text();
    const currentLabel = $('#tk-stealing-from-future .to-be-budgeted-label').text();

    const budgetBreakdown = componentLookup('budget-breakdown');
    if (!budgetBreakdown) return;

    if (document.querySelector('.to-be-budgeted.is-negative')) {
      return;
    }

    const { negativeFutureBudgetedMonth } = budgetBreakdown;
    if (negativeFutureBudgetedMonth) {
      const nextAmount = formatCurrency(negativeFutureBudgetedMonth.available);
      const nextLabel = negativeFutureBudgetedMonth.availableLabel;

      if (currentAmount !== nextAmount || currentLabel !== nextLabel) {
        $('#tk-stealing-from-future').remove();

        $('.budget-header-totals', header).after(
          $('<div>', {
            id: 'tk-stealing-from-future',
            class: 'budget-header-item budget-header-totals tk-stealing-from-future',
          }).append(
            $('<div>', { class: 'to-be-budgeted is-negative' }).append(
              $('<div>')
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
    } else {
      $('#tk-stealing-from-future').remove();
    }
  }
}
