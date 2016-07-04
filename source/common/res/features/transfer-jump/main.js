(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.ynabTransferJump = (function () {
      (function ($) {
        $.event.special.destroyed = {
          remove(o) {
            if (o.handler) {
              o.handler();
            }
          }
        };
      }(jQuery));

      var TransactionAmountTypes = {
        INFLOW: 0,
        OUTFLOW: 1
      };

      function getJumpTransaction(entryDate, amount) {
        var transaction = null;
        if (amount.type === TransactionAmountTypes.INFLOW) {
          transaction = $('div.ynab-grid-body-row').
            has("div.ynab-grid-cell-date:contains('" + entryDate + "')").
            has("div.ynab-grid-cell-outflow:contains('" + amount.amount + "')");
        } else {
          transaction = $('div.ynab-grid-body-row').
            has("div.ynab-grid-cell-date:contains('" + entryDate + "')").
            has("div.ynab-grid-cell-inflow:contains('" + amount.amount + "')");
        }

        return transaction;
      }

      function getTransactionData(clickedJumpElement) {
        var entry = clickedJumpElement.closest('div.ynab-grid-cell-payeeName');
        var accountName = entry.attr('title').split(': ')[1];
        var accountSelectorId = $("div.nav-account-name[title='" + accountName + "']").parent().attr('id');
        var entryDate = entry.siblings('div.ynab-grid-cell-date').text();
        var entryInflow = entry.siblings('div.ynab-grid-cell-inflow').text();
        var entryOutflow = entry.siblings('div.ynab-grid-cell-outflow').text();
        var transaction = {
          accountName,
          accountSelectorId,
          date: entryDate,
          inflow_amount: $.trim(entryInflow),
          outflow_amount: $.trim(entryOutflow)
        };

        return transaction;
      }

      $('.transfer-jump').off().on('click', function () {
        var entry = getTransactionData($(this));

        var transactionAmount = {};
        if (entry.inflow_amount !== '$0.00') {
          transactionAmount.amount = entry.inflow_amount;
          transactionAmount.type = TransactionAmountTypes.INFLOW;
        } else {
          transactionAmount.amount = entry.outflow_amount;
          transactionAmount.type = TransactionAmountTypes.OUTFLOW;
        }

        // Simulate a click on the target account (i.e., the "other side")
        // of the transfer:
        $('div#' + entry.accountSelectorId).trigger('click');

        setTimeout(function () {
          var jumpTransaction = getJumpTransaction(entry.date, transactionAmount);
          if (jumpTransaction) {
            var grid = jumpTransaction.parent();
            grid.scrollTop(jumpTransaction.offset().top);
            jumpTransaction.addClass('is-checked');
          }
        }, 100);

        return false;
      });

      var transferCells = $("div.ynab-grid-cell-payeeName[title*='Transfer']");
      if (transferCells.length) {
        transferCells.each(function () {
          var $this = $(this);
          var id = $this.parent().attr('id') + '_jump';
          var jumpIcon = '<button id="' + id + '" class="transfer-jump"><span>&#8646;</span></button>';

          if (!$('button#' + id).length) {
            $this.prepend(jumpIcon);
          }
        });
      }
    }()); // Keep feature functions contained within this object
  } else {
    setTimeout(poll, 250);
  }
}());
