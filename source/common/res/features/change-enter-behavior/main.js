(function poll() {
  if (typeof ynabToolKit !== 'undefined'  && ynabToolKit.pageReady === true) {

    ynabToolKit.changeEnterBehavior = function ()  {
      function changeEnterBehaviorInit() {
        var addTransactionRow = getAddTransactionRow();

        if (addTransactionRow) {
          changeEnterBehaviorApply();
        } else {
          setTimeout(changeEnterBehaviorInit, 250);
        }
      }

      function changeEnterBehaviorApply() {
        var addTransactionRow = getAddTransactionRow();

        var memoField = addTransactionRow.getElementsByClassName('ynab-grid-cell-memo')[0].getElementsByClassName('ember-text-field')[0];
        memoField.onkeydown = function (event) {
          var e = event || window.event;
          changeEnterBehaviorClick(e);
        };

        var outflowField = addTransactionRow.getElementsByClassName('ynab-grid-cell-outflow')[0].getElementsByClassName('ember-text-field')[0];
        outflowField.onkeydown = function (event) {
          var e = event || window.event;
          changeEnterBehaviorClick(e);
        };

        var inflowField = addTransactionRow.getElementsByClassName('ynab-grid-cell-inflow')[0].getElementsByClassName('ember-text-field')[0];
        inflowField.onkeydown = function (event) {
          var e = event || window.event;
          changeEnterBehaviorClick(e);
        };

        setTimeout(changeEnterBehaviorRemoved, 250);
      }

      function changeEnterBehaviorClick(e) {
        if (e.keyCode == 13) {
          e.preventDefault();
          e.stopPropagation();
          var saveButtons = document.getElementsByClassName('ynab-grid-add-rows')[0].getElementsByClassName('button-primary');
          for (var i = 0; i < saveButtons.length; i++) {
            var button = saveButtons[i];
            if ((' ' + button.className + ' ').indexOf(' button-another ') == -1) {
              button.click();
              return;
            }
          }
        }
      }

      function changeEnterBehaviorRemoved() {
        var addTransactionRow = getAddTransactionRow();
        if (addTransactionRow === null) {
          setTimeout(changeEnterBehaviorInit, 250);
        } else {
          setTimeout(changeEnterBehaviorRemoved, 250);
        }
      }

      setTimeout(changeEnterBehaviorInit, 250);
    };

    function getAddTransactionRow() {
      var addRow = document.getElementsByClassName('ynab-grid-add-rows');

      if (addRow.length) {
        var addTransaction = addRow[0].getElementsByClassName('ynab-grid-body-row');
        if (addTransaction.length) {
          return addTransaction[0];
        } else {
          return null;
        }
      } else {
        return null;
      }
    }

    ynabToolKit.changeEnterBehavior(); // Activate itself

  } else {
    setTimeout(poll, 250);
  }
})();
