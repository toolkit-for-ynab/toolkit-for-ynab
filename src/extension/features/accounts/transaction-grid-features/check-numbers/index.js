import { TransactionGridFeature } from '../feature';
import { isCurrentRouteAccountsPage } from 'toolkit/extension/utils/ynab';
import { controllerLookup } from 'toolkit/extension/utils/ember';

export class CheckNumbers extends TransactionGridFeature {
  injectCSS() {
    return require('./index.css');
  }

  insertHeader() {
    if ($('.ynab-grid-header .ynab-grid-cell-toolkit-check-number').length) return;

    var $headerRow = $('.ynab-grid-header');
    var checkNumberHeader = $('.ynab-grid-cell-inflow', $headerRow).clone();
    checkNumberHeader.removeClass('ynab-grid-cell-inflow');
    checkNumberHeader.addClass('ynab-grid-cell-toolkit-check-number');
    checkNumberHeader.text('CHECK NUMBER').css('font-weight', 'normal');
    checkNumberHeader.insertAfter($('.ynab-grid-cell-memo', $headerRow));
    checkNumberHeader.click(event => {
      event.preventDefault();
      event.stopPropagation();
    });

    if ($('.ynab-grid-body .ynab-grid-body-row-top .ynab-grid-cell-toolkit-check-number').length)
      return;
    var $topRow = $('.ynab-grid-body-row-top');
    var topRowCheckNumber = $('.ynab-grid-cell-inflow', $topRow).clone();
    topRowCheckNumber.removeClass('ynab-grid-cell-inflow');
    topRowCheckNumber.addClass('ynab-grid-cell-toolkit-check-number');
    topRowCheckNumber.insertAfter($('.ynab-grid-cell-memo', $topRow));
  }

  cleanup() {
    $('.ynab-grid-cell-toolkit-check-number').remove();
  }

  // Should return a boolean that informs AdditionalColumns feature that it
  // is on a page that should receive the new column.
  shouldInvoke() {
    return isCurrentRouteAccountsPage();
  }

  // Called when one of the grid rows is getting inserted into the dom but
  // before it actually makes it into the dom. This should be doing the grunt
  // of the work.
  willInsertColumn() {
    const isAddRow = this.get('_debugContainerKey') === 'component:register/grid-add';
    const isEditRow = this.get('_debugContainerKey') === 'component:register/grid-edit';
    const isGridRow = this.get('_debugContainerKey') === 'component:register/grid-row';
    if (isAddRow || isEditRow) {
      const $editingRow = $(this.element);
      const editingTransaction = this.get('content');
      const $inputBox = $('<input placeholder="check number">')
        .addClass('accounts-text-field')
        .addClass('ynab-grid-cell-toolkit-check-number-input')
        .blur(function() {
          editingTransaction.set('checkNumber', $(this).val());
        });

      $inputBox.val(editingTransaction.get('checkNumber'));
      $('<div class="ynab-grid-cell ynab-grid-cell-toolkit-check-number"><div>')
        .append($inputBox)
        .insertAfter($('.ynab-grid-cell-memo', $editingRow));
    } else if (isGridRow) {
      // view only column
      const $currentRow = $(this.element);
      const checkNumberCell = $('.ynab-grid-cell-memo', $currentRow).clone();
      checkNumberCell.removeClass('ynab-grid-cell-memo');
      checkNumberCell.addClass('ynab-grid-cell-toolkit-check-number');

      const transaction = this.get('content');
      checkNumberCell.text(transaction.get('checkNumber') || '');
      checkNumberCell.insertAfter($('.ynab-grid-cell-memo', $currentRow));
    } else {
      // dead column
      const checkNumberCell = $('.ynab-grid-cell-memo', this.element).clone();
      checkNumberCell.removeClass('ynab-grid-cell-memo');
      checkNumberCell.addClass('ynab-grid-cell-toolkit-check-number');
      checkNumberCell.insertAfter($('.ynab-grid-cell-memo', this.element));
      checkNumberCell.empty();
    }
  }

  // this is really hacky but I'm not sure what else to do, most of these components
  // double render so the `willInsertElement` works for those but the add rows
  // and footer are weird. add-rows doesn't double render and will work every time
  // after the component has been cached but footer is _always_ a new component WutFace
  handleSingleRenderColumn($appendToRows, componentName) {
    if (componentName === 'register/grid-add') {
      const accountsController = controllerLookup('accounts');
      const editingTransaction = accountsController.get('editingTransaction');
      const $inputBox = $('<input placeholder="check number">')
        .addClass('accounts-text-field')
        .addClass('ynab-grid-cell-toolkit-check-number-input')
        .blur(function() {
          editingTransaction.set('checkNumber', $(this).val());
        });

      if (typeof editingTransaction !== 'undefined') {
        $inputBox.val(editingTransaction.get('checkNumber'));
      }

      $('<div class="ynab-grid-cell ynab-grid-cell-toolkit-check-number"><div>')
        .append($inputBox)
        .insertAfter($('.ynab-grid-cell-memo', $appendToRows));

      return;
    }

    $appendToRows.each((index, row) => {
      if ($('.ynab-grid-cell-toolkit-check-number', row).length === 0) {
        const checkNumberCell = $('.ynab-grid-cell-memo', row).clone();
        checkNumberCell.removeClass('ynab-grid-cell-memo');
        checkNumberCell.addClass('ynab-grid-cell-toolkit-check-number');
        checkNumberCell.insertAfter($('.ynab-grid-cell-memo', row));
        checkNumberCell.empty();
      }
    });
  }
}
