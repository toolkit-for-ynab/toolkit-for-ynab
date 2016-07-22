(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.splitTransactionAutoAdjust = (function () {
      var addAnotherSplit;
      var splitTransactionRow;
      var isInitialized = false;
      var addingAnotherSplit = false;
      var deletingSplit = false;

      function initialize() {
        splitTransactionRow = $('.ynab-grid-add-rows');
        addAnotherSplit = $('.ynab-grid-split-add-sub-transaction');

        splitTransactionRow.on('keyup', '.currency-input .ember-text-field', onKeyPress);
        splitTransactionRow.on('click', '.ynab-grid-sub-remove', onDeleteSplit);
        addAnotherSplit.on('click', onAddAnotherSplit);
      }

      function onKeyPress() {
        var element = this;
        var currentInputClass = getCurrentInputClass();

        if ($(element).parents(currentInputClass).length) {
          autoFillNextRow(this);
        }
      }

      function getCurrentInputClass() {
        var firstRow = $('.ynab-grid-body-row', splitTransactionRow).first();
        var outflowValue = ynab.unformat($('.ynab-grid-cell-outflow .ember-text-field', firstRow).val());
        var inflowValue = ynab.unformat($('.ynab-grid-cell-inflow .ember-text-field', firstRow).val());
        return outflowValue > 0 ? '.ynab-grid-cell-outflow' :
               inflowValue > 0 ? '.ynab-grid-cell-inflow' : false;
      }

      function onAddAnotherSplit() {
        addingAnotherSplit = true;
      }

      function onDeleteSplit() {
        deletingSplit = true;
      }

      function autoFillNextRow(currentInputElement) {
        var inputClass = getCurrentInputClass();
        var total = ynab.unformat($(inputClass + ' .ember-text-field', splitTransactionRow.children().eq(0)).val()) * 1000;

        if (inputClass && total) {
          var currentRow = $(currentInputElement).parents('.ynab-grid-body-row');
          var currentRowIndex = splitTransactionRow.children().index(currentRow);
          var currentValue = ynab.unformat($(currentInputElement).val()) * 1000;

          splitTransactionRow.children().each(function (index, splitRow) {
            if (index === currentRowIndex) {
              var nextRow = splitTransactionRow.children().eq(currentRowIndex + 1);
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

      return {
        observe(changedNodes) {
          var addTransactionSplit = changedNodes.has('button button-primary modal-account-categories-split-transaction ');
          var editSplitTransaction = changedNodes.has('ynab-grid-body-row ynab-grid-body-split is-editing');
          var splitTransactionNodeChanged = addTransactionSplit && !editSplitTransaction;
          var splitTransactionButton = $('.ynab-grid-split-add-sub-transaction').length !== 0;

          if (addingAnotherSplit) {
            addingAnotherSplit = false;
            var inputClass = getCurrentInputClass();
            var currentLastSplitRow = $('.ynab-grid-body-sub', splitTransactionRow).eq(-2);
            var lastSplitInput = $(inputClass + ' .ember-text-field', currentLastSplitRow)[0];
            autoFillNextRow(lastSplitInput);
            return;
          }

          if (deletingSplit) {
            deletingSplit = false;
            return;
          }

          if (splitTransactionNodeChanged && splitTransactionButton) {
            if (!isInitialized) {
              isInitialized = true;
              initialize();
            }
          } else if (splitTransactionNodeChanged && !splitTransactionButton) {
            isInitialized = false;
          }
        }
      };
    }()); // Keep feature functions contained within this object
  } else {
    setTimeout(poll, 250);
  }
}());
