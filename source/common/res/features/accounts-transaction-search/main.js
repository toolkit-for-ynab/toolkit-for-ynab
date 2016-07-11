(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.accountTransactionSearch = (function () {
      var originalTransactions;

      var searchFields = ['outflow', 'inflow', 'accountName', 'payeeName', 'subCategoryNameWrapped', 'memo'];

      function addSearchBox() {
        if ($('.toolkit-transaction-search', '.accounts-toolbar-right').length === 0) {
          var $searchBox = $('<div class="toolkit-transaction-search">' +
                              '<i class="flaticon stroke x-2 toolkit-search-clear"></i>' +
                              '<input class="accounts-text-field" placeholder="Search Transactions...">' +
                            '</div>');

          $('.accounts-text-field', $searchBox).on('keydown', function (event) {
            if (event.keyCode === 46 || event.keyCode === 8 || event.keyCode === 67) {
              // delete/backspace/'c'
              event.stopPropagation();
            }
          }).on('keyup', function (event) {
            if (event.keyCode === 46 || event.keyCode === 8 || event.keyCode === 67) {
              // delete/backspace/'c'
              event.preventDefault();
              event.stopPropagation();
            }

            var searchTerm = $(this).val();
            filterContentResults(searchTerm);
          });

          $('.toolkit-search-clear', $searchBox).click(function () {
            $('.accounts-text-field', $searchBox).val('');
            $('.accounts-text-field', $searchBox).focus();
            filterContentResults('');
          });

          $('.accounts-toolbar-right').prepend($searchBox);
        }
      }

      function onAccountChange() {
        addSearchBox();
        $('.toolkit-transaction-search').val('');

        var accountsController = ynabToolKit.shared.containerLookup('controller:accounts');
        originalTransactions = accountsController.get('contentResults').slice();
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
        invoke: function () {
          var accountsController = ynabToolKit.shared.containerLookup('controller:accounts');
          var applicationController = ynabToolKit.shared.containerLookup('controller:application');

          applicationController.addObserver('selectedAccountId', function () {
            Ember.run.later(onAccountChange, 250);
          });

          if (applicationController.get('currentPath').indexOf('accounts')) {
            onAccountChange();
          }

          accountsController.addObserver('hiddenTxnsCount', function () {
            Ember.run.next(function () {
              originalTransactions = accountsController.get('contentResults').slice();
            });
          });
        }
      };
    }());

    ynabToolKit.accountTransactionSearch.invoke();
  } else {
    setTimeout(poll, 250);
  }
}());
