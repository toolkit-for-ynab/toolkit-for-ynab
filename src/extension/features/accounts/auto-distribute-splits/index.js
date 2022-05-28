import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { stripCurrency, formatCurrency } from 'toolkit/extension/utils/currency';

const DISTRIBUTE_BUTTON_ID = 'toolkit-auto-distribute-splits-button';

function actualNumber(n) {
  return typeof n === 'number' && !Number.isNaN(n);
}

export class AutoDistributeSplits extends Feature {
  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    this.onElement('.ynab-grid-actions', this.injectDistributeButton);
  }

  observe() {
    this.onElement('.ynab-grid-actions', this.injectDistributeButton);
  }

  injectDistributeButton(element) {
    if ($(`#${DISTRIBUTE_BUTTON_ID}`, element).length) {
      return;
    }

    if ($('.ynab-grid-split-add-sub-transaction').length) {
      $('.ynab-grid-actions-buttons .button-cancel').after(
        $('<button>', {
          id: DISTRIBUTE_BUTTON_ID,
          class: 'button button-primary',
          text: 'Auto-Distribute',
        }).on('click', (event) => {
          this.distribute();
          $(event.currentTarget).trigger('blur');
        })
      );
    } else {
      $(`#${DISTRIBUTE_BUTTON_ID}`).remove();
    }
  }

  destroy() {
    $(`#${DISTRIBUTE_BUTTON_ID}`).remove();
  }

  distribute() {
    const [[, ...subCells], [total, ...subValues]] = this.getCellsAndValues();
    if (!this.canDistribute(total, subValues)) {
      this.alertCannotDistribute();
      return;
    }

    const remaining = this.getRemainingValue(total, subValues);
    if (remaining < 0 && !this.confirmSubtraction()) {
      return;
    }

    const newSubValues = this.getUpdatedSubValues(subValues, total, remaining);
    this.adjustValues(subCells, newSubValues);
  }

  getCellsAndValues() {
    const cells = $('.is-editing .ynab-grid-cell-outflow input').toArray();
    const values = cells.map((node) => stripCurrency(node.value));
    return [cells, values];
  }

  canDistribute(total, subValues) {
    return actualNumber(total) && !subValues.every((n) => n === 0) && subValues.any(actualNumber);
  }

  alertCannotDistribute() {
    // eslint-disable-next-line no-alert
    window.alert(
      `Please fill in the transaction total and at least one sub-transaction in order to auto-distribute the remaining amount between sub-transactions`
    );
  }

  getRemainingValue(total, subValues) {
    return total - subValues.filter(actualNumber).reduce((a, b) => a + b);
  }

  confirmSubtraction() {
    // eslint-disable-next-line no-alert
    return window.confirm(
      'Sub-transactions add up to more than the total, are you sure you want to subtract from them?'
    );
  }

  getUpdatedSubValues(subValues, total, originalRemainingAmount) {
    const subTotal = total - originalRemainingAmount;
    let remainingAmountToDistribute = originalRemainingAmount;
    return subValues.map((subValue, i) => {
      let proportionOfRemaining = (subValue / subTotal) * originalRemainingAmount;
      proportionOfRemaining = Math.round(proportionOfRemaining * 100) / 100;
      const isLastSubValue = i + 1 === subValues.length;
      const amountToAdd =
        isLastSubValue &&
        (proportionOfRemaining === 0 || proportionOfRemaining > remainingAmountToDistribute)
          ? remainingAmountToDistribute
          : proportionOfRemaining;
      remainingAmountToDistribute -= amountToAdd;
      return Math.round((subValue + amountToAdd) * 100) / 100;
    });
  }

  adjustValues(subCells, newSubValues) {
    subCells.forEach((cell, i) => {
      $(cell).val(actualNumber(newSubValues[i]) ? formatCurrency(newSubValues[i], true) : '');
      $(cell).trigger('change');
      $(cell).trigger('blur');
    });
  }
}
