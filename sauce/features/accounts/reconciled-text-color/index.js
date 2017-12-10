import { Feature } from 'toolkit/core/feature';
import * as toolkitHelper from 'toolkit/helpers/toolkit';

export class ReconciledTextColor extends Feature {
  injectCSS() {
    if (this.settings.enabled === '1') {
      return require('./green.css');
    } else if (this.settings.enabled === '2') {
      return require('./lightgray.css');
    } else if (this.settings.enabled === '3') {
      return require('./darkgray.css');
    } else if (this.settings.enabled === '4') {
      return require('./darkgraybg.css');
    }
  }

  shouldInvoke() {
    return toolkitHelper.getCurrentRouteName().indexOf('account') !== -1;
  }

  invoke() {
    var transactionRows = $('.ynab-grid-body-row');
    var previousReconciled = false;
    $(transactionRows).each(function () {
      var clearedField = $(this).find('.ynab-grid-cell-cleared>i').first();
      var isReconciled = clearedField.hasClass('is-reconciled');
      var isChecked = $(this).hasClass('is-checked');

      if (isReconciled && !isChecked) {
        $(this).addClass('is-reconciled-row');
      }

      if ($(this).hasClass('ynab-grid-body-sub') && previousReconciled && !isChecked) {
        $(this).addClass('is-reconciled-row');
        isReconciled = true;
      }

      // if a sub-transaction was already marked as reconciled, then the above statement
      // would not catch it. Do this to catch the sub transactions
      if (isChecked) {
        $(this).removeClass('is-reconciled-row');
      }

      previousReconciled = isReconciled;
    });
  }

  observe(changedNodes) {
    if (changedNodes.has('ynab-grid-body') || changedNodes.has('ynab-grid-body-row ynab-grid-body-parent')) {
      this.invoke();
    }
  }
}
