(function poll() { 
  // Waits until an external function gives us the all clear that we can run (at /shared/main.js)
  if ( typeof ynabToolKit !== "undefined"  && ynabToolKit.actOnChangeInit === true ) {
  
    ynabToolKit.exportTransactions = new function()  { // Keep feature functions contained within this

      // ######################
      // # LIBRARY / UTILITIES
      // ######################
      
      // # Export data as CSV from javascript
      // Based on http://halistechnology.com/2015/05/28/use-javascript-to-export-your-data-as-csv/

      // Convert array of similar objects (shared keys) into a CSV body
      function convertArrayOfObjectsToCSV(args) {  
        var result, ctr, keys, columnDelimiter, lineDelimiter, data;

        data = args.data || null;
        if (data == null || !data.length) {
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

        keys = Object.keys(data[0])
        result = prepRow(keys);

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


      // # Export Transactions from YNAB
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


        // get category -- returns {category, mastercategory} -- with internal cache
        var categoryMap = {};
        var getCategory = function (id) {
          if (!id) { return; }
          if (typeof categoryMap[id] === 'undefined') {
            var sub = entityManager.getSubCategoryById(id);
            var master = entityManager.getMasterCategoryById(sub.masterCategoryId);
            categoryMap[id] = {
              category: sub.name,
              master: master.name
            };
          }
          return categoryMap[id];
        }

        // "clean" a transaction into the information to export
        function cleanTransaction(yTrans) {
          var trans = {};
          
          //trans.id = yTrans.entityId;
          trans.flag = yTrans.flag || '';
          trans.account = getAccountName(yTrans.accountId);
          trans.date = yTrans.date.format('YYYY-MM-DD');
          trans.payee = getPayeeName(yTrans.payeeId);
          
          // Category might be null if not yet matched
          var cat = getCategory(yTrans.subCategoryId);
          trans.masterCategory = cat ? cat.master: '';
          trans.category = cat ? cat.category : '';
          
          trans.memo = yTrans.memo || '';
          trans.amount = yTrans.amount / 1000;
          trans.cleared = yTrans.cleared || '';
          
          // Check number is still implemented, though hidden from the UI
          //trans.checkNumber = yTrans.checkNumber || ''; 
          return trans;
        }

        var ynabTransArray = entityManager.getAllTransactions();
        var cleanedTransArray = ynabTransArray.map(cleanTransaction);
        return cleanedTransArray;
      }

      function downloadTransactions() {
        var entityManager = ynab.YNABSharedLib.defaultInstance.entityManager;
        var transactions = getTransactionArray(entityManager);
        var csv = convertArrayOfObjectsToCSV({data: transactions});
        downloadCSV({contents: csv});
      }



      // ####################
      // # FEATURE CODE 
      // ####################

      this.invoke = function() {

        // Build the UI button
        var exportButton = '<button id="toggleSplits" class="ember-view button"><i class="ember-view flaticon stroke download-document"></i> Export </button>';
        this.button = $(exportButton).on('click', downloadTransactions);
        
        // Determine whether to show the button on this screen
        this.observe();
      };
      

      this.observe = function() {
        // Only show export button on the 'All Accounts' screen      
        if (location.href.endsWith('/accounts')) {
          this.button.insertAfter(".accounts-toolbar .accounts-toolbar-edit-transaction");
        } else {
          this.button.detach();
        }
          
      };
    };

  } else {
    setTimeout(poll, 250);
  }   
})();
