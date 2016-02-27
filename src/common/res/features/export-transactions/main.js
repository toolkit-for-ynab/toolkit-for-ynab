(function poll() {
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.actOnChangeInit === true ) {

    ynabToolKit.exportTransactions = (function(){

      // ######################
      // # LIBRARY / UTILITIES
      // ######################

      // Export data as CSV from javascript
      // ==================================

      // Based on http://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/

      // Convert array of similar objects (shared keys) into a CSV body
      function convertArrayOfObjectsToCSV(args) {
        var result, ctr, keys, titles, columnDelimiter, lineDelimiter, data;

        data = args.data || null;
        if (data === null || !data.length) {
          return null;
        }

        columnDelimiter = args.columnDelimiter || ',';
        lineDelimiter = args.lineDelimiter || '\n';

        function quoteField(val) {
          val = val || '';
          try {
            val = val.replace(/"/g, '""');
          } catch (ex) {}
          return '"' + val + '"';
        }

        function prepRow(values) {
          var quoted = values.map(quoteField);
          return quoted.join(columnDelimiter) + lineDelimiter;
        }

        keys = Object.keys(data[0]);
        titles = args.titles || keys;
        result = prepRow(titles);

        data.forEach(function(item) {
          var values = keys.map(function(key) { return item[key]; });
          result += prepRow(values);
        });

        return result;
      }

      // Given a file body, create a file and prompt browser to download it
      function downloadFile(args) {
        var contents = args.contents || '';
        var mimetype = args.mimetype || 'text/plain';
        var filename = args.filename || 'export.txt';
        var link, data;

        contents = 'data:' + mimetype + 'charset=utf-8,' + contents;
        data = encodeURI(contents);

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
      }

      // Given a csv body, create a csv file (and prompt browser to download it)
      function downloadCSV(args) {
        args = Object.assign({
          filename: 'export.csv',
          mimetype: 'text/csv'
        }, args);
        downloadFile(args);
      }

      // Sort an Array of Objects by key
      function sortByKey(transactions, key, order) {

        // Simple comparator
        function compare(a, b) {
          if (a[key] < b[key]) return -1;
          if (a[key] > b[key]) return 1;
          return 0;
        }

        transactions = transactions.copy();
        transactions.sort(compare);
        if (order === 'DESC') {
          transactions.reverse();
        }
        return transactions;
      }

      // String Manipulation
      // ===================

      // convert "camelCaseStrings" to "Camel Case Strings"
      function camelCaseToTitle(input) {
        var output = input.replace(/([A-Z])/g, " $1");
        output = output[0].toUpperCase() + output.slice(1);
        return output;
      }



      // # Export Transactions from YNAB
      // ===============================

      // Build an array of "cleaned" transactions -- containing just the information to export
      // Pass in the entityManager -- theoretically allows swapping out a different interface
      function getTransactionArray(entityManager) {

        // get payee
        var getPayeeName = function (id) {
          var payee = entityManager.getPayeeById(id);
          if (payee) {
            return payee.name;
          }
        };

        // get account name - with internal cache b/c this is common
        var accountNameMap = {};
        var getAccountName = function (id) {
          if (typeof accountNameMap[id] === 'undefined') {
            var accountName = entityManager.getAccountById(id).accountName;
            accountNameMap[id] = accountName;
          }
          return accountNameMap[id];
        };

        // Map "internal" codes to more user-friendly labels
        var categoryNamesMap = {
          'Internal Master Category': '*** YNAB Internal Categories',
          'Split (Multiple Categories)...': 'Split (Multiple Categories)',
          "Split SubCategory": 'Split (Multiple Categories)',
          'Immediate Income SubCategory': '*** Inflow: To Be Budgeted'
        };

        // get category -- returns {category, mastercategory} -- with internal cache
        // and check for a "user-friendly" name remapping
        var categoryMap = {};
        var getCategory = function (id) {
          if (!id) { return; }
          if (typeof categoryMap[id] === 'undefined') {
            var sub = entityManager.getSubCategoryById(id);
            var master = entityManager.getMasterCategoryById(sub.masterCategoryId);
            categoryMap[id] = {
              category: categoryNamesMap[sub.name] || sub.name,
              master: categoryNamesMap[master.name] || master.name
            };
          }
          return categoryMap[id];
        };


        // "clean" a transaction into the information to export
        function cleanTransaction(yTrans) {
          var trans = {};

          //trans.id = yTrans.entityId;
          trans.flag = yTrans.flag || '';
          trans.account = getAccountName(yTrans.accountId);
          trans.date = yTrans.date.format('YYYY-MM-DD');
          trans.payee = getPayeeName(yTrans.payeeId);

          // Category might be null if not yet matched -- in that case, use ''
          var cat = getCategory(yTrans.subCategoryId);
          trans.masterCategory = cat ? cat.master : '';
          trans.category = cat ? cat.category : '';

          trans.memo = yTrans.memo || '';
          trans.amount = yTrans.amount === null ? '' : yTrans.amount / 1000;
          trans.cleared = yTrans.cleared || '';

          // Check number is still implemented, though hidden from the UI
          //trans.checkNumber = yTrans.checkNumber || '';
          return trans;
        }

        var ynabTransArray = entityManager.getAllTransactions();

        // exclude soft-deleted ("tombstone") transactions
        ynabTransArray = ynabTransArray.filter(function (yTrans) {
          return !yTrans.get('isTombstone');
        });

        // sort the transactions before inserting subtransactions, since
        // Array.prototype.sort is not stable
        ynabTransArray = sortByKey(ynabTransArray, 'date', 'DESC');

        // insert subtransactions (associated with split transactions)
        var completeYnabTransArray = [];
        ynabTransArray.forEach(function (yTrans) {
          var subs = entityManager.getSubTransactionsByTransactionId(yTrans.entityId);
          if (subs.length > 0) {
            // hide the amount on split transactions to avoid counting twice
            var noAmountYTrans = {};
            Object.assign(noAmountYTrans, yTrans, {amount: null});
            completeYnabTransArray.push(noAmountYTrans);

            // copy all the common transaction fields to each of the subtransactions
            subs.forEach(function(ySubTrans) {
              var augmentedYSubTrans = {};
              Object.assign(augmentedYSubTrans, yTrans, ySubTrans);
              completeYnabTransArray.push(augmentedYSubTrans);
            });
          } else {
            completeYnabTransArray.push(yTrans);
          }
        });

        var cleanedTransArray = completeYnabTransArray.map(cleanTransaction);
        return cleanedTransArray;
      }


      function downloadTransactions() {
        var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;
        var transactions = getTransactionArray(entityManager);

        var titles = Object.keys(transactions[0]).map(function (key) {
          return camelCaseToTitle(key);
        });

        var csv = convertArrayOfObjectsToCSV({
          data: transactions,
          titles: titles
        });

        downloadCSV({contents: csv});
      }

      // ####################
      // # FEATURE CODE
      // ####################

      // Set up export button
      var EXPORT_BUTTON_MARKUP = '<button id="toggleSplits" class="ember-view button"><i class="ember-view flaticon stroke download-document"></i> Export </button>';

      return {
        button: $(EXPORT_BUTTON_MARKUP).on('click', downloadTransactions),
        invoke: function() {
          // Determine whether to show or hide the export button
          // Only show button on the 'All Accounts' screen
          if (location.href.endsWith('/accounts')) {
            ynabToolKit.exportTransactions.button.insertAfter(".accounts-toolbar .accounts-toolbar-edit-transaction");
          } else {
            ynabToolKit.exportTransactions.button.detach();
          }
        },

        observe: function(changedNodes) {
          // Changes to `.navlink-accounts` means we are newly on or off the All Accounts page
          if (changedNodes.has('navlink-accounts') ||
              changedNodes.has('navlink-accounts active')) {
            ynabToolKit.exportTransactions.invoke();
          }
        }
      };
    })(); // Keep feature functions contained within this object

    ynabToolKit.exportTransactions.invoke();

  } else {
    setTimeout(poll, 250);
  }
})();
