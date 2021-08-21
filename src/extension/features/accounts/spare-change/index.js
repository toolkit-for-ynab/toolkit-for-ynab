import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';
import { formatCurrency } from 'toolkit/extension/utils/currency';

export class SpareChange extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  // invoke has potential of being pretty processing heavy (needing to sort content, then update calculation for every row)
  // wrapping it in a debounce means that if the user continuously scrolls down we won't clog up the event loop.
  invoke() {
    controllerLookup('accounts').addObserver('areChecked', this.calculateSpareChange);
  }

  destroy() {
    controllerLookup('accounts').removeObserver('areChecked', this.calculateSpareChange);
    $('#tk-spare-change').remove();
  }

  calculateSpareChange() {
    const { areChecked } = controllerLookup('accounts');
    if (!areChecked.length) {
      $('#tk-spare-change').remove();
      return;
    }

    let runningAmount = 0;
    areChecked.forEach((transaction) => {
      const outflow = ynab.convertFromMilliDollars(transaction.outflow);
      const nextDollar = Math.ceil(outflow);
      runningAmount += ynab.convertToMilliDollars(nextDollar - outflow);
    });

    let emphasis;
    if (runningAmount > 0) {
      emphasis = 'positive';
    } else if (runningAmount < 0) {
      emphasis = 'negative';
    } else {
      emphasis = 'zero';
    }

    const $spareChangeAmount = $('#tk-spare-change-amount');
    if ($spareChangeAmount.length) {
      $spareChangeAmount.attr('class', `currency ${emphasis}`);
      $spareChangeAmount.text(formatCurrency(runningAmount));
    } else {
      $('.accounts-header-balances-right').prepend(
        $('<div>', {
          id: 'tk-spare-change',
          class: 'accounts-header-balances-amount tk-spare-change',
        })
          .append(
            $('<span>', {
              id: 'tk-spare-change-amount',
              class: `currency ${emphasis}`,
              text: formatCurrency(runningAmount),
            })
          )
          .append($('<div>', { class: 'accounts-header-label', text: 'Spare Change' }))
      );
    }
  }
}
