import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteBudgetPage } from 'toolkit/extension/utils/ynab';
import { getEmberView } from 'toolkit/extension/utils/ember';
import * as currency from 'toolkit/extension/utils/currency';
import { addToolkitEmberHook } from 'toolkit/extension/utils/toolkit';

export class SubtractUpcomingFromAvailable extends Feature {
  shouldInvoke() {
    return isCurrentRouteBudgetPage();
  }

  invoke() {
    let totalUpcoming = 0;

    $('.budget-table-row.is-sub-category').each((_, element) => {
      const category = getEmberView(element.id, 'category');
      if (!category) {
        return;
      }

    addToolkitEmberHook(this, 'budget/inspector/default-inspector', 'didRender', () => {
      if (!this.shouldInvoke()) return;
      this.addTotalAvailableAfterUpcoming(totalUpcoming);
    });

    addToolkitEmberHook(this, 'budget/inspector/multi-select-inspector', 'didRender', () => {
      if (!this.shouldInvoke()) return;
      this.addTotalAvailableAfterUpcoming(totalUpcoming);
    });
      if (category.upcomingTransactions) {
        const availableObject = $(`#${element.id} .ynab-new-budget-available-number`);
        const availableElement = availableObject[0];

        const availableTextObject = $(`#${availableElement.id} .user-data`);
        const availableTextElement = availableTextObject[0];

        const available = Number(currency.stripCurrency(availableTextElement.innerText));
        const upcoming = Number(category.upcomingTransactions);
        const availableAfterUpcoming = available + upcoming;

        $(availableTextObject).text(currency.formatCurrency(availableAfterUpcoming));

        availableObject.children('svg.icon-upcoming').remove();

        const hasCautiousCredit =
          availableObject.hasClass('cautious') && availableObject.hasClass('credit');

        if (!hasCautiousCredit) {
          const classes = 'cautious upcoming credit positive zero negative';

          availableObject.removeClass(classes);
          availableTextObject.removeClass(classes);

          const currencyClass = this.determineCurrencyClass(availableAfterUpcoming);
          availableObject.addClass(currencyClass);
          availableTextObject.addClass(currencyClass);
        }

        totalUpcoming += upcoming;
      }
    });

    addToolkitEmberHook(this, 'budget/inspector/default-inspector', 'didRender', () =>
      this.addTotalAvailableAfterUpcoming(totalUpcoming)
    );

    addToolkitEmberHook(this, 'budget/inspector/multi-select-inspector', 'didRender', () =>
      this.addTotalAvailableAfterUpcoming(totalUpcoming)
    );
  }

  determineCurrencyClass(amount) {
    let currencyClass = 'positive';

    if (amount < 0) {
      currencyClass = 'negative';
    } else if (amount === 0) {
      currencyClass = 'zero';
    }

    return currencyClass;
  }

  createInspectorElement(totalAvailableAfterUpcoming) {
    const currencyClass = this.determineCurrencyClass(totalAvailableAfterUpcoming);

    totalAvailableAfterUpcoming = currency.formatCurrency(totalAvailableAfterUpcoming);

    return $(`
      <div class="total-available-after-upcoming-inspector">
        <h3>TOTAL AVAILABLE AFTER UPCOMING TRANSACTIONS</h3>
        <h1 title>
          <span class="user-data currency ${currencyClass}">
            ${totalAvailableAfterUpcoming}
          </span>
        </h1>
        <hr />
      </div>
    `);
  }

  addTotalAvailableAfterUpcoming(totalUpcoming) {
    $('.total-available-after-upcoming-inspector').remove();

    const totalAvailableHeader = $('.budget-inspector-content')
      .find('h3')
      .filter(function() {
        return $(this).text() === 'TOTAL AVAILABLE';
      });

    const endOfTotalAvailable = totalAvailableHeader.nextAll('hr')[0];
    const totalAvailableData = totalAvailableHeader.next();

    const totalAvailableElement = totalAvailableData.find('span.user-data')[0];
    const totalAvailable = Number(currency.stripCurrency(totalAvailableElement.innerText));
    const totalAvailableAfterUpcoming = totalAvailable + totalUpcoming;

    this.createInspectorElement(totalAvailableAfterUpcoming).insertAfter(endOfTotalAvailable);
  }

  onRouteChanged() {
    if (!this.shouldInvoke()) return;
    this.invoke();
  }
}
