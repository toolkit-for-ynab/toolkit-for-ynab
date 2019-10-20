import { Feature } from 'toolkit/extension/features/feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';

export class SplitTransactionAutoAdjust extends Feature {
  addAnotherSplit;

  splitTransactionRow;

  isInitialized;

  addingAnotherSplit;

  deletingSplit;

  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  invoke() {
    this.addAnotherSplit = null;
    this.splitTransactionRow = null;
    this.isInitialized = false;
    this.addingAnotherSplit = false;
    this.deletingSplit = false;
  }

  initialize() {
    this.splitTransactionRow = $('.ynab-grid-add-rows');
    this.addAnotherSplit = $('.ynab-grid-split-add-sub-transaction');

    this.splitTransactionRow.on(
      'keyup',
      '.currency-input .ember-text-field',
      this,
      this.onKeyPress
    );
    this.splitTransactionRow.on('click', '.ynab-grid-sub-remove', this.onDeleteSplit);
    this.addAnotherSplit.on('click', this.onAddAnotherSplit);
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
    let firstRow = $('.ynab-grid-body-row', this.splitTransactionRow).first();
    let outflowValue = ynab.unformat(
      $('.ynab-grid-cell-outflow .ember-text-field', firstRow).val()
    );
    let inflowValue = ynab.unformat($('.ynab-grid-cell-inflow .ember-text-field', firstRow).val());
    return outflowValue > 0
      ? '.ynab-grid-cell-outflow'
      : inflowValue > 0
      ? '.ynab-grid-cell-inflow'
      : false;
  }

  onAddAnotherSplit() {
    this.addingAnotherSplit = true;
  }

  onDeleteSplit() {
    this.deletingSplit = true;
  }

  autoFillNextRow(currentInputElement) {
    let inputClass = this.getCurrentInputClass();
    let total =
      ynab.unformat(
        $(inputClass + ' .ember-text-field', this.splitTransactionRow.children().eq(0)).val()
      ) * 1000;
    // local version of the class variable to get around the 'this' issue in the .each() function below.
    let splitTransactionRow = this.splitTransactionRow;

    if (inputClass && total) {
      let currentRow = $(currentInputElement).parents('.ynab-grid-body-row');
      let currentRowIndex = splitTransactionRow.children().index(currentRow);
      let currentValue = ynab.unformat($(currentInputElement).val()) * 1000;

      splitTransactionRow.children().each(function(index, splitRow) {
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
          if (index !== 0) {
            // don't decrement total if we're the total row, that's silly
            total -= ynab.unformat($(inputClass + ' .ember-text-field', splitRow).val()) * 1000;
          }
        }
      });
    }
  }

  observe(changedNodes) {
    if (!this.shouldInvoke()) return;

    let addTransactionSplit = changedNodes.has(
      'button button-primary modal-account-categories-split-transaction'
    );
    let editSplitTransaction = changedNodes.has(
      'ynab-grid-body-row ynab-grid-body-split is-editing'
    );
    let splitTransactionNodeChanged = addTransactionSplit && !editSplitTransaction;
    let splitTransactionButton = $('.ynab-grid-split-add-sub-transaction').length !== 0;

    if (this.addingAnotherSplit) {
      this.addingAnotherSplit = false;

      let inputClass = this.getCurrentInputClass();
      let currentLastSplitRow = $('.ynab-grid-body-sub', this.splitTransactionRow).eq(-2);
      let lastSplitInput = $(inputClass + ' .ember-text-field', currentLastSplitRow)[0];

      this.autoFillNextRow(lastSplitInput);
    } else if (this.deletingSplit) {
      this.deletingSplit = false;
    } else if (splitTransactionNodeChanged) {
      if (splitTransactionButton) {
        if (!this.isInitialized) {
          this.isInitialized = true;
          this.initialize();
        }
      } else {
        this.isInitialized = false;
      }
    }
  }
}
