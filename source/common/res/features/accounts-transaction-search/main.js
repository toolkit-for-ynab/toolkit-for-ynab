(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.pageReady === true && ynabToolKit.onEmberViewRenderedInit === true) {
    ynabToolKit.accountTransactionSearch = (function () {
      var originalTransactions;

      var searchFields = ['outflow', 'inflow', 'accountName', 'payeeName', 'subCategoryNameWrapped', 'memo'];

      function addSearchBox() {
        var accountsController = ynabToolKit.shared.containerLookup('controller:accounts');

        if ($('.toolkit-transaction-search', '.accounts-toolbar-right').length === 0) {
          var searchBox = $('<input class="accounts-text-field toolkit-transaction-search" placeholder="Search Transactions..."></input>')
            .on('keydown', function (event) {
              if (event.keyCode === 46 || event.keyCode === 8 || event.keyCode === 67) { // delete/backspace/'c'
                event.stopPropagation();
              }
            })
            .on('keyup', function (event) {
              if (event.keyCode === 46 || event.keyCode === 8 || event.keyCode === 67) { // delete/backspace/'c'
                event.preventDefault();
                event.stopPropagation();
              }

              var searchTerm = $(this).val();
              filterContentResults(searchTerm);
            });

          $('.accounts-toolbar-right').append(searchBox);
        }

        originalTransactions = accountsController.get('contentResults').slice();

        accountsController.addObserver('hiddenTxnsCount', function () {
          originalTransactions = accountsController.get('contentResults').slice();
        });
      }

      function filterContentResults(filterValue) {
        filterValue = filterValue.toString().toLowerCase();
        var accountsController = ynabToolKit.shared.containerLookup('controller:accounts');
        var filterCategory = filterValue.substr(0, filterValue.indexOf(':'));

        switch (filterCategory) {
          case 'account':
            filterCategory = 'accountName';
            filterValue = filterValue.substr(filterValue.indexOf(':') + 1);
            break;
          case 'payee':
            filterCategory = 'payeeName';
            filterValue = filterValue.substr(filterValue.indexOf(':') + 1);
            break;
          case 'category':
            filterCategory = 'subCategoryNameWrapped';
            filterValue = filterValue.substr(filterValue.indexOf(':') + 1);
            break;
          case 'memo':
          case 'outflow':
          case 'inflow':
            filterValue = filterValue.substr(filterValue.indexOf(':') + 1);
            break;
          default:
            filterCategory = null;
        }

        var newContents = originalTransactions.filter(function (transaction) {
          var isMatchingTransaction = false;

          if (filterCategory) {
            var categoryValue = transaction.get(filterCategory);
            var isNumericCategory = (filterCategory === 'outflow' || filterCategory === 'inflow');

            if (typeof categoryValue !== 'undefined' && categoryValue !== null) {
              if (isNumericCategory && categoryValue === (ynab.unformat(filterValue) * 1000)) {
                isMatchingTransaction = true;
              } else if (categoryValue.toString().toLowerCase().indexOf(filterValue) > -1) {
                isMatchingTransaction = true;
              }
            }
          } else {
            for (var i = 0; i < searchFields.length; i++) {
              var fieldValue = transaction.get(searchFields[i]);
              var isNumericSearchField = searchFields[i] === 'outflow' || searchFields[i] === 'inflow';

              if (typeof fieldValue !== 'undefined' && fieldValue !== null) {
                if (isNumericSearchField) {
                  var fieldValueNum = ynab.unformat(filterValue);
                  if (fieldValueNum > 0 && fieldValue === (fieldValueNum * 1000)) {
                    isMatchingTransaction = true;
                    break;
                  }
                } else if (fieldValue.toLowerCase().indexOf(filterValue) > -1) {
                  isMatchingTransaction = true;
                  break;
                }
              }
            }
          }

          return isMatchingTransaction;
        });

        newContents.push(originalTransactions[originalTransactions.length - 1]);
        accountsController.set('contentResults', newContents);
      }

      return {
        onAfterViewRendered: function (view) {
          if (view.containerKey === 'view:ynab-grid/header') {
            setTimeout(addSearchBox, 250);
          }
        }
      };
    }());
  } else {
    setTimeout(poll, 250);
  }
}());
