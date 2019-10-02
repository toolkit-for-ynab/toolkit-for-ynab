import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { stripCurrency, formatCurrency } from 'toolkit/extension/utils/currency';

const DISTRIBUTE_BUTTON_ID = 'toolkit-auto-distribute-splits-button';

function actualNumber(n) {
  return typeof n === 'number' && !Number.isNaN(n);
}

export class AutoDistributeSplits extends Feature {
  constructor() {
    super();
    this.button = document.createElement('button');
    this.button.id = DISTRIBUTE_BUTTON_ID;
    this.button.classList.add('button');
    this.button.classList.add('button-primary');
    this.button.innerHTML = 'Auto-Distribute';
    this.button.onclick = () => {
      this.distribute();
      this.button.blur();
    };
  }

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    if (this.buttonShouldBePresent()) {
      this.ensureButtonPresent();
    } else {
      this.ensureButtonNotPresent();
    }
  }

  // don't really care which nodes have been changed since the feature doesn't trigger off of changed nodes but the presence of nodes.
  observe() {
    if (!this.shouldInvoke) return;

    this.invoke();
  }

  buttonShouldBePresent() {
    return $('.ynab-grid-split-add-sub-transaction').length > 0;
  }

  ensureButtonPresent() {
    if (!this.buttonPresent()) {
      $('.ynab-grid-actions-buttons .button-cancel').after(this.button);
    }
  }

  ensureButtonNotPresent() {
    if (this.buttonPresent()) {
      $('#' + DISTRIBUTE_BUTTON_ID).remove();
    }
  }

  buttonPresent() {
    return $('#' + DISTRIBUTE_BUTTON_ID).length > 0;
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
    const values = cells.map(node => stripCurrency(node.value));
    return [cells, values];
  }

  canDistribute(total, subValues) {
    return actualNumber(total) && subValues.any(actualNumber);
  }

  alertCannotDistribute() {
    // eslint-disable-next-line no-alert
    alert(
      'Please fill in the transaction total and at least one ' +
        'sub-transaction in order to auto-distribute the ' +
        'remaining amount between sub-transactions'
    );
  }

  getRemainingValue(total, subValues) {
    return total - subValues.filter(actualNumber).reduce((a, b) => a + b);
  }

  confirmSubtraction() {
    // eslint-disable-next-line no-alert
    return window.confirm(
      'Sub-transactions add up to more than the total, ' +
        'are you sure you want to subtract from them?'
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
