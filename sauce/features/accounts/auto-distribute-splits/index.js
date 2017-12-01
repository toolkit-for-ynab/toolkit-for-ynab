import { Feature } from 'toolkit/core/feature';
import { getEmberView } from 'toolkit/helpers/toolkit';

const DISTRIBUTE_BUTTON_ID = 'auto-distribute-splits-button';
const SPLIT_BUTTON_CLASS =
  'button button-primary modal-account-categories-split-transaction';

function actualNumber(n) {
  return typeof n === 'number' && !isNaN(n);
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

  observe(changedNodes) {
    if (changedNodes.has(SPLIT_BUTTON_CLASS) && !this.buttonPresent()) {
      this.addButton();
    }
  }

  buttonPresent() {
    return !!document.getElementById(DISTRIBUTE_BUTTON_ID);
  }

  addButton() {
    $('.ynab-grid-actions-buttons .button-cancel').after(this.button);
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

    this.adjustValues(
      subCells,
      subValues.map(this.proportionalValue(total, remaining))
    );
  }

  getCellsAndValues() {
    const cells = $('.is-editing .ynab-grid-cell-outflow input').toArray();
    const values = cells.map(node => parseFloat(node.value.trim()));
    return [cells, values];
  }

  canDistribute(total, subValues) {
    return actualNumber(total) && subValues.any(actualNumber);
  }

  alertCannotDistribute() {
    // eslint-disable-next-line no-alert
    alert(
      'Must fill in at least the total and one sub-transaction ' +
        'in order to auto-distribute'
    );
  }

  getRemainingValue(total, subValues) {
    return total - subValues.filter(actualNumber).reduce((a, b) => a + b);
  }

  confirmSubtraction() {
    // eslint-disable-next-line no-alert
    return confirm(
      'Sub-transactions add up to more than the total, ' +
        'are you sure you want to subtract from them?'
    );
  }

  proportionalValue(total, remaining) {
    return value => value + value / (total - remaining) * remaining;
  }

  adjustValues(subCells, newSubValues) {
    subCells.forEach((cell, i) => {
      $(cell).val(
        actualNumber(newSubValues[i])
          ? (Math.round(newSubValues[i] * 100) / 100).toFixed(2)
          : ''
      );
      $(cell).trigger('change');
    });

    getEmberView($('.ynab-grid-add-rows')[0].id).calculateSplitRemaining();
  }
}
