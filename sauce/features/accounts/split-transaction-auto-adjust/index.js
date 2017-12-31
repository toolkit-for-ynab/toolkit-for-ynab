import { Feature } from 'toolkit/core/feature';
import { getCurrentRouteName } from 'toolkit/helpers/toolkit';

let addAnotherSplit;
let splitTransactionRow;
let isInitialized;
let addingAnotherSplit;
let deletingSplit;

export class SplitTransactionAutoAdjust extends Feature {
  shouldInvoke() {
    return getCurrentRouteName().indexOf('account') !== -1;
  }

  invoke() {
    addAnotherSplit = null;
    splitTransactionRow = null;
    isInitialized = false;
    addingAnotherSplit = false;
    deletingSplit = false;
  }

  initialize() {
    splitTransactionRow = $('.ynab-grid-add-rows');
    addAnotherSplit = $('.ynab-grid-split-add-sub-transaction');

    splitTransactionRow.on('keyup', '.currency-input .ember-text-field', this, this.onKeyPress);
    splitTransactionRow.on('click', '.ynab-grid-sub-remove', this.onDeleteSplit);
    addAnotherSplit.on('click', this.onAddAnotherSplit);
  }

  onKeyPress(event) {
    let _this = event.data;
    let element = $(this);
    let currentInputClass = _this.getCurrentInputClass();

    if ($(element).parents(currentInputClass).length) {
      _this.autoFillNextRow(element);
    }
  }

  getCurrentInputClass() {
    let firstRow = $('.ynab-grid-body-row', splitTransactionRow).first();
    let outflowValue = ynab.unformat($('.ynab-grid-cell-outflow .ember-text-field', firstRow).val());
    let inflowValue = ynab.unformat($('.ynab-grid-cell-inflow .ember-text-field', firstRow).val());
    return outflowValue > 0 ? '.ynab-grid-cell-outflow' :
           inflowValue > 0 ? '.ynab-grid-cell-inflow' : false;
  }

  onAddAnotherSplit() {
    addingAnotherSplit = true;
  }

  onDeleteSplit() {
    deletingSplit = true;
  }

  autoFillNextRow(currentInputElement) {
    let inputClass = this.getCurrentInputClass();
    let total = ynab.unformat($(inputClass + ' .ember-text-field', splitTransactionRow.children().eq(0)).val()) * 1000;

    if (inputClass && total) {
      let currentRow = $(currentInputElement).parents('.ynab-grid-body-row');
      let currentRowIndex = splitTransactionRow.children().index(currentRow);
      let currentValue = ynab.unformat($(currentInputElement).val()) * 1000;

      splitTransactionRow.children().each(function (index, splitRow) {
        if (index === currentRowIndex) {
          let nextRow = splitTransactionRow.children().eq(currentRowIndex + 1);
          if (index === 0) {
            $(inputClass + ' .ember-text-field', nextRow).val(ynab.formatCurrency(total));
            $(inputClass + ' .ember-text-field', nextRow).trigger('change');
          } else {
            total -= currentValue;
            $(inputClass + ' .ember-text-field', nextRow).val(ynab.formatCurrency(total));
            $(inputClass + ' .ember-text-field', nextRow).trigger('change');
          }
        } else if (index < currentRowIndex) {
          if (index !== 0) { // don't decrement total if we're the total row, that's silly
            total -= ynab.unformat($(inputClass + ' .ember-text-field', splitRow).val()) * 1000;
          }
        }
      });
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    let addTransactionSplit = changedNodes.has('button button-primary modal-account-categories-split-transaction');
    let editSplitTransaction = changedNodes.has('ynab-grid-body-row ynab-grid-body-split is-editing');
    let splitTransactionNodeChanged = addTransactionSplit && !editSplitTransaction;
    let splitTransactionButton = $('.ynab-grid-split-add-sub-transaction').length !== 0;

    if (addingAnotherSplit) {
      addingAnotherSplit = false;

      let inputClass = this.getCurrentInputClass();
      let currentLastSplitRow = $('.ynab-grid-body-sub', splitTransactionRow).eq(-2);
      let lastSplitInput = $(inputClass + ' .ember-text-field', currentLastSplitRow)[0];

      this.autoFillNextRow(lastSplitInput);
    } else {
      if (deletingSplit) {
        deletingSplit = false;
      } else {
        if (splitTransactionNodeChanged) {
          if (splitTransactionButton) {
            if (!isInitialized) {
              isInitialized = true;
              this.initialize();
            }
          } else {
            isInitialized = false;
          }
        }
      }
    }
  }
}
