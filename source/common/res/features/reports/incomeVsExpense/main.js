(function poll() {
  if (typeof ynabToolKit !== 'undefined' && typeof Highcharts !== 'undefined') {
    ynabToolKit.incomeVsExpense = (function () {
      let reportData = {
        months: []
      };

      function placeInSubCategory(transaction, masterCategoryData, categoryViewModel) {
        // grab the sub category id the data for it inside of our nested object
        let subCategoryId = transaction.get('subCategoryId');
        let subCategoryData = masterCategoryData.subCategories[subCategoryId];

        // if we haven't created that data yet, then default everything to 0/empty
        if (typeof subCategoryData === 'undefined') {
          masterCategoryData.subCategories[subCategoryId] = {
            internalData: categoryViewModel.getSubCategoryById(subCategoryId),
            total: 0,
            transactions: []
          };

          subCategoryData = masterCategoryData.subCategories[subCategoryId];
        }

        subCategoryData.transactions.push(transaction);
        subCategoryData.total += transaction.get('outflow');
      }

      function placeInMasterCategory(transaction, moneyFlowObject, categoryViewModel, payeeViewModel) {
        let payeeId = transaction.get('payeeId');
        let masterCategoryId = transaction.get('masterCategoryId');

        // if the transaction is negative, throw it in the outflow object keyed on
        // the masterCategoryId and then grab the data for the subCategory as well
        if (transaction.getAmount() < 0) {
          let outflowData = moneyFlowObject.outflows[masterCategoryId];

          if (!outflowData) {
            moneyFlowObject.outflows[masterCategoryId] = {
              internalData: categoryViewModel.getMasterCategoryById(masterCategoryId),
              subCategories: {},
              total: 0
            };

            outflowData = moneyFlowObject.outflows[masterCategoryId];
          }

          outflowData.total += transaction.getAmount();
          placeInSubCategory(transaction, outflowData, categoryViewModel);
        } else {
          let inflowData = moneyFlowObject.inflows[payeeId];

          if (!inflowData) {
            moneyFlowObject.inflows[payeeId] = {
              internalData: payeeViewModel.getPayeeById(payeeId),
              total: 0
            };

            inflowData = moneyFlowObject.inflows[payeeId];
          }

          inflowData.total += transaction.getAmount();
        }
      }

      return {
        availableAccountTypes: 'onbudget',
        reportHeaders() {
          return 'Income vs. Expense';
        },

        // custom data filter for our transactions. YNAB has a debt master category and an internal master category
        // which I'm pretty sure stores credit card transfer stuff and things like "Split (Multiple Categories...)"
        // type transactions. we ignore these guys because they will throw off numbers! we also ignore inflows and transfers
        // because this is a "spending" by category report and neither of those are "spending" right? I think that's right.
        filterTransaction(transaction) {
          // can't use a promise here and the _result *should* if there's anything to worry about, it's this line
          // but im still not worried about it.
          let categoriesViewModel = ynab.YNABSharedLib.getBudgetViewModel_CategoriesViewModel()._result;
          let masterCategoryId = transaction.get('masterCategoryId');
          let subCategoryId = transaction.get('subCategoryId');
          let isTransfer = masterCategoryId === null || subCategoryId === null;
          let internalMasterCategory = categoriesViewModel.getMasterCategoryById(masterCategoryId);
          let isInternalYNABCategory = isTransfer ? false :
                                       internalMasterCategory.isDebtPaymentMasterCategory();

          return !isTransfer && !isInternalYNABCategory;
        },

        calculate(transactions) {
          return new Promise((resolve) => {
            // grab the categories from ynab's shared lib with their promise -- we can trust it.
            ynab.YNABSharedLib.getBudgetViewModel_CategoriesViewModel().then((categoryViewModel) => {
              ynab.YNABSharedLib.getBudgetViewModel_PayeesViewModel().then((payeeViewModel) => {
                // make sure the data is empty before we start doing an calculating/data layout stuff
                let currentDataObject = null;

                transactions.forEach((transaction) => {
                  let formattedDate = ynabToolKit.reports.formatTransactionDatel8n(transaction);

                  if (currentDataObject === null) {
                    // we're the first object, get it started.
                    currentDataObject = {
                      date: formattedDate,
                      inflows: {},
                      outflows: {}
                    };
                  } else if (currentDataObject.date !== formattedDate) {
                    // it's time for a new dataObject, push the current one and make a new one
                    reportData.months.push(currentDataObject);

                    currentDataObject = {
                      date: formattedDate,
                      inflows: {},
                      outflows: {}
                    };
                  }

                  placeInMasterCategory(transaction, currentDataObject, categoryViewModel, payeeViewModel);
                });

                // make sure we push the last month of data
                reportData.months.push(currentDataObject);

                console.log(reportData);

                resolve();
              });
            });
          });
        },

        createChart($reportsData) {
          // set up the container for our graph and for our side-panel (the legend)
          $reportsData.html(
            `<table class="ynabtk-table inflows">
              <thead>
                <tr class="ynabtk-tr ynab-header-row inflows">
                  <th class="ynabtk-th">Income</th>
                </tr>
              </thead>
              <tfoot>
                <tr class="ynabtk-tr">
                  <th class="ynabtk-th">Total Income</th>
                </tr>
              </tfoot>
              <tbody class="ynabtk-tbody">
                <tr>
                  <td class="ynabtk-td">All Income Sources</td>
                </tr>
              </tbody>
            </table>

            <table class="ynabtk-table outflows">
              <thead>
                <tr class="ynabtk-tr ynab-header-row outflows">
                  <th class="ynabtk-th">Expenses</th>
                </tr>
              </thead>
              <tfoot>
                <tr class="ynabtk-tr">
                  <th class="ynabtk-th">Total Expenses</th>
                </tr>
              </tfoot>
              <tbody class="ynabtk-tbody">
              </tbody>
            </table>`
          );

          // reportData.months.forEach((monthData) => {
          //   // first append the date to the header
          //   $('.ynabtk-tr.ynab-header-row.income').append(monthData.date);
          // });
        }
      };
    }());
  } else {
    setTimeout(poll, 250);
  }
}());
