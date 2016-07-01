(function ynabTransferJump() {
  if (typeof Em !== 'undefined' && typeof Ember !== 'undefined' && typeof $ !== 'undefined') {
    (function ($) {
      $.event.special.destroyed = {
        remove: function (o) {
          if (o.handler) {
            o.handler();
          }
        },
      };
    })(jQuery);

    var DEBUG = false;

    var TransactionAmountTypes = {
      INFLOW: 0,
      OUTFLOW: 1,
    };

    $('.transfer-jump').off().on('click', function () {
      if (DEBUG) {
        console.log('Entering click event...');
      }

      var entry = getTransactionData($(this));

      var transactionAmount = {};
      if (entry.inflow_amount !== '$0.00') {
        transactionAmount.amount = entry.inflow_amount;
        transactionAmount.type = TransactionAmountTypes.INFLOW;
      } else {
        transactionAmount.amount = entry.outflow_amount;
        transactionAmount.type = TransactionAmountTypes.OUTFLOW;
      }

      if (DEBUG) {
        console.log('var dump: transactionAmount');
        console.log(transactionAmount);
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
        var _this = $(this);
        var id = _this.parent().attr('id') + '_jump';
        var jumpIcon = '<button id="' + id + '" class="transfer-jump"><span>&#8646;</span></button>';

        if (!$('button#' + id).length) {
          _this.prepend(jumpIcon);
        }
      });
    }
  }

  setTimeout(ynabTransferJump, 10);

  function getJumpTransaction(entryDate, amount) {
    if (DEBUG) {
      console.log('Entering getJumpTransaction()...');
      console.log('var dump: entryDate');
      console.log(entryDate);
      console.log('var dump: amount');
      console.log(amount);
    }

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

    if (DEBUG) {
      console.log('var dump: transaction');
      console.log(transaction);
      console.log('Exiting getJumpTransaction()...');
    }

    return transaction;
  }

  function getTransactionData(clickedJumpElement) {
    if (DEBUG) {
      console.log('Entering getJumpTransaction()...');
      console.log('var dump: clickedJumpElement');
      console.log(clickedJumpElement);
    }

    var entry = clickedJumpElement.closest('div.ynab-grid-cell-payeeName');
    var accountName = entry.attr('title').split(': ')[1];
    var accountSelectorId = $("div.nav-account-name[title='" + accountName + "']").parent().attr('id');
    var entryDate = entry.siblings('div.ynab-grid-cell-date').text();
    var entryInflow = entry.siblings('div.ynab-grid-cell-inflow').text();
    var entryOutflow = entry.siblings('div.ynab-grid-cell-outflow').text();
    var transaction = {
      accountName: accountName,
      accountSelectorId: accountSelectorId,
      date: entryDate,
      inflow_amount: $.trim(entryInflow),
      outflow_amount: $.trim(entryOutflow),
    };

    if (DEBUG) {
      console.log('var dump: transaction');
      console.log(transaction);
      console.log('Exiting getJumpTransaction()...');
    }

    return transaction;
  }
})();
