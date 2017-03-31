(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true) {
    ynabToolKit.checkNumbers = (function () {
      let currentlyRunning = false;

      function updateCheckNumberColumn() {
        insertHeader();

        $('.ynab-grid-container .ynab-grid-body .ynab-grid-body-row:not(.is-editing)').each((index, element) => {
          let $element = $(element);

          if ($element.hasClass('ynab-grid-body-empty')) return;

          insertValue(element);
        });
      }

      function insertHeader() {
        if ($('.ynab-grid-header .ynab-toolkit-grid-cell-check-number').length) return;

        var $headerRow = $('.ynab-grid-header');
        var checkNumberHeader = $('.ynab-grid-cell-inflow', $headerRow).clone();
        checkNumberHeader.removeClass('ynab-grid-cell-inflow');
        checkNumberHeader.addClass('ynab-toolkit-grid-cell-check-number');
        checkNumberHeader.text('CHECK NUMBER');
        checkNumberHeader.insertAfter($('.ynab-grid-cell-memo', $headerRow));

        if ($('.ynab-grid-body .ynab-grid-body-row-top .ynab-toolkit-grid-cell-check-number').length) return;
        var $topRow = $('.ynab-grid-body-row-top');
        var topRowCheckNumber = $('.ynab-grid-cell-inflow', $topRow).clone();
        topRowCheckNumber.removeClass('ynab-grid-cell-inflow');
        topRowCheckNumber.addClass('ynab-toolkit-grid-cell-check-number');
        topRowCheckNumber.insertAfter($('.ynab-grid-cell-memo', $topRow));
      }

      function insertValue(element) {
        var $currentRow = $(element);
        var currentRowRunningBalance = $('.ynab-grid-cell-memo', $currentRow).clone();
        currentRowRunningBalance.removeClass('ynab-grid-cell-memo');
        currentRowRunningBalance.addClass('ynab-toolkit-grid-cell-check-number');

        var emberView = ynabToolKit.shared.getEmberView($currentRow.attr('id'));
        var transaction = emberView.get('content');
        var checkNumber = transaction.get('checkNumber');

        currentRowRunningBalance.text(checkNumber || '');
        currentRowRunningBalance.insertAfter($('.ynab-grid-cell-memo', $currentRow));
      }

      function onYnabGridyBodyChanged() {
        updateCheckNumberColumn();
      }

      function addCheckNumberInputBox() {
        let accountsController = ynabToolKit.shared.containerLookup('controller:accounts');
        let $editingRow = $('.ynab-grid-body-row.is-editing');
        let $inputBox = $('<input placeholder="check number">')
                          .addClass('accounts-text-field')
                          .addClass('ynab-toolkit-grid-cell-check-number-input')
                          .blur(function () {
                            let editingTransaction = accountsController.get('editingTransaction');
                            editingTransaction.set('checkNumber', $(this).val());
                          });

        $editingRow.each((index, element) => {
          var $element = $(element);
          if (!$('.ynab-toolkit-grid-cell-check-number', $element).length) {
            if (index) { // No input field on these lines
              $('<div class="ynab-grid-cell ynab-toolkit-grid-cell-check-number"><div>')
                .insertAfter($('.ynab-grid-cell-memo', $element));
            } else { // Add input field to first line only
              let editingTransaction = accountsController.get('editingTransaction');
              $inputBox.val(editingTransaction.get('checkNumber'));

              $('<div class="ynab-grid-cell ynab-toolkit-grid-cell-check-number"><div>')
              .append($inputBox)
              .insertAfter($('.ynab-grid-cell-memo', $element));
            }
          }
        });
      }

      return {
        // invoke has potential of being pretty processing heavy (needing to sort content, then add calculation to every row)
        // wrapping it in a later means that if the user continuously scrolls down we won't clog up the event loop.
        invoke: function invoke() {
          currentlyRunning = true;

          Ember.run.later(function () {
            var applicationController = ynabToolKit.shared.containerLookup('controller:application');

            if (applicationController.get('currentPath').indexOf('accounts') > -1) {
              if (applicationController.get('selectedAccountId')) {
                onYnabGridyBodyChanged();
              } else {
                $('.ynab-toolkit-grid-cell-check-number').remove();
              }
            }

            currentlyRunning = false;
          }, 250);
        },

        observe: function invoke(changedNodes) {
          if (changedNodes.has('ynab-grid-body') && !currentlyRunning) {
            ynabToolKit.checkNumbers.invoke();
          }

          if (changedNodes.has('ynab-grid-cell ynab-grid-cell-accountName user-data') && changedNodes.has('ynab-grid-cell ynab-grid-cell-date user-data')) {
            addCheckNumberInputBox();
          }

          if (changedNodes.has('ynab-grid-body-row is-editing')) {
            addCheckNumberInputBox();
          }
        }
      };
    }());

    ynabToolKit.checkNumbers.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
