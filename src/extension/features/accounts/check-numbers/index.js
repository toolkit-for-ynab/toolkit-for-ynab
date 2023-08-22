import { Feature } from 'toolkit/extension/features/feature';
import { getEmberView } from 'toolkit/extension/utils/ember';

export class CheckNumbers extends Feature {
  injectCSS() {
    return require('./index.css');
  }

  shouldInvoke() {
    return true;
  }

  invoke() {
    this.addToolkitEmberHook('register/grid-header', 'didRender', this.insertHeader);
    this.addToolkitEmberHook('register/grid-actions', 'didRender', this.insertDeadColumn);

    const valueColumns = [
      'register/grid-sub',
      'register/grid-row',
      'register/grid-scheduled',
      'register/grid-scheduled-sub',
      'register/grid-pending',
      'register/grid-split',
    ];

    valueColumns.forEach((key) => {
      this.addToolkitEmberHook(key, 'didInsertElement', this.insertValueColumn);
    });

    const inputColumns = ['register/grid-edit'];

    inputColumns.forEach((key) => {
      this.addToolkitEmberHook(key, 'didInsertElement', this.insertInputColumn);
    });
  }

  destroy() {
    $('.ynab-grid-cell-tk-check-number').remove();
  }

  insertHeader() {
    if ($('.ynab-grid-header .ynab-grid-cell-tk-check-number').length) return;

    const $headerRow = $('.ynab-grid-header');
    const checkNumberHeader = $('.ynab-grid-cell-inflow', $headerRow).clone();
    checkNumberHeader.removeClass('ynab-grid-cell-inflow');
    checkNumberHeader.addClass('ynab-grid-cell-tk-check-number');
    checkNumberHeader.text('CHECK NUMBER').css('font-weight', 'normal');
    checkNumberHeader.insertAfter($('.ynab-grid-cell-memo', $headerRow));
    checkNumberHeader.on('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
    });

    if ($('.ynab-grid-body .ynab-grid-body-row-top .ynab-grid-cell-tk-check-number').length) return;
    const $topRow = $('.ynab-grid-body-row-top');
    const topRowCheckNumber = $('.ynab-grid-cell-inflow', $topRow).clone();
    topRowCheckNumber.removeClass('ynab-grid-cell-inflow');
    topRowCheckNumber.addClass('ynab-grid-cell-tk-check-number');
    topRowCheckNumber.insertAfter($('.ynab-grid-cell-memo', $topRow));
  }

  insertInputColumn(element) {
    let transaction;
    const emberView = getEmberView(element.id);
    if (emberView) {
      transaction = emberView.content;
    }

    const $editingRow = $(element);
    const $inputBox = $('<input placeholder="check number">')
      .addClass('accounts-text-field')
      .addClass('ynab-grid-cell-tk-check-number-input')
      .on('blur', function () {
        transaction.checkNumber = $(this).val();
      });

    $inputBox.val(transaction.checkNumber);
    $('<div class="ynab-grid-cell ynab-grid-cell-tk-check-number"><div>')
      .append($inputBox)
      .insertAfter($('.ynab-grid-cell-memo', $editingRow));
  }

  insertValueColumn(element) {
    let transaction;
    const emberView = getEmberView(element.id);
    if (emberView) {
      transaction = emberView.content;
    }

    if (!transaction) {
      this.insertDeadColumn(element);
      return;
    }

    const $currentRow = $(element);
    const checkNumberCell = $('.ynab-grid-cell-memo', $currentRow).clone();
    checkNumberCell.removeClass('ynab-grid-cell-memo');
    checkNumberCell.addClass('ynab-grid-cell-tk-check-number');

    checkNumberCell.text(transaction.checkNumber || '');
    checkNumberCell.insertAfter($('.ynab-grid-cell-memo', $currentRow));
  }

  insertDeadColumn(element) {
    const checkNumberCell = $('.ynab-grid-cell-memo', element).clone();
    checkNumberCell.removeClass('ynab-grid-cell-memo');
    checkNumberCell.addClass('ynab-grid-cell-tk-check-number');
    checkNumberCell.insertAfter($('.ynab-grid-cell-memo', element));
    checkNumberCell.empty();
  }
}
