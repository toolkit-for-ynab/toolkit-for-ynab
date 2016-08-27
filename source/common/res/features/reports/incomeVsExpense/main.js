(function poll() {
  if (typeof ynabToolKit !== 'undefined' && typeof Highcharts !== 'undefined') {
    ynabToolKit.incomeVsExpense = (function () {
      let dateLabels;
      let reportData = {
        inflowsByPayee: { total: 0 },
        outflowsByCategory: { total: 0 }
      };

      function generateInitialDataArray() {
        return dateLabels.map(() => 0);
      }

      function placeInSubCategory(transaction, masterCategoryData, categoryViewModel) {
        let formattedDate = ynabToolKit.reports.formatTransactionDatel8n(transaction);
        let dateIndex = dateLabels.indexOf(formattedDate);

        // grab the sub category id the data for it inside of our nested object
        let subCategoryId = transaction.get('subCategoryId');
        let subCategoryData = masterCategoryData.subCategories[subCategoryId];

        // if we haven't created that data yet, then default everything to 0/empty
        if (typeof subCategoryData === 'undefined') {
          masterCategoryData.subCategories[subCategoryId] = {
            internalData: categoryViewModel.getSubCategoryById(subCategoryId),
            totalByDate: generateInitialDataArray()
          };

          subCategoryData = masterCategoryData.subCategories[subCategoryId];
        }

        subCategoryData.totalByDate[dateIndex] += transaction.get('outflow');
      }

      function placeInMasterCategory(transaction, categoriesObject, categoryViewModel) {
        let formattedDate = ynabToolKit.reports.formatTransactionDatel8n(transaction);
        let dateIndex = dateLabels.indexOf(formattedDate);
        let masterCategoryId = transaction.get('masterCategoryId');
        let masterCategoryData = categoriesObject[masterCategoryId];

        if (!masterCategoryData) {
          categoriesObject[masterCategoryId] = {
            internalData: categoryViewModel.getMasterCategoryById(masterCategoryId),
            subCategories: {},
            totalByDate: generateInitialDataArray()
          };

          masterCategoryData = categoriesObject[masterCategoryId];
        }

        reportData.totalOutflowsByDate[dateIndex] += transaction.get('outflow');
        placeInSubCategory(transaction, masterCategoryData, categoryViewModel);
      }

      function placeInPayee(transaction, payeesObject, payeeViewModel) {
        let formattedDate = ynabToolKit.reports.formatTransactionDatel8n(transaction);
        let dateIndex = dateLabels.indexOf(formattedDate);
        let payeeId = transaction.get('payeeId');
        let payeeData = payeesObject[payeeId];

        if (typeof payeeData === 'undefined') {
          payeesObject[payeeId] = {
            internalData: payeeViewModel.getPayeeById(payeeId),
            totalByDate: generateInitialDataArray()
          };

          payeeData = payeesObject[payeeId];
        }

        reportData.totalInflowsByDate[dateIndex] += transaction.get('inflow');
        payeeData.totalByDate[dateIndex] += transaction.get('inflow');
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
                dateLabels = ynabToolKit.reports.generateMonthLabelsFromFirstTransaction(transactions, true);

                reportData.inflowsByPayee = {};
                reportData.totalInflowsByDate = generateInitialDataArray();

                reportData.outflowsByCategory = {};
                reportData.totalOutflowsByDate = generateInitialDataArray();

                transactions.forEach((transaction) => {
                  if (transaction.getAmount() > 0) {
                    placeInPayee(transaction, reportData.inflowsByPayee, payeeViewModel);
                  } else {
                    placeInMasterCategory(transaction, reportData.outflowsByCategory, categoryViewModel);
                  }
                });

                console.log(reportData);

                resolve();
              });
            });
          });
        },

        createChart($reportsData) {
          // set up the container for our graph and for our side-panel (the legend)
          $reportsData.css({
            overflow: 'scroll',
            'overflow-y': 'scroll'
          }).html(
          `<div class="income-vs-expense-report">
            <table class="ynabtk-table inflows">
              <thead>
                <tr class="ynabtk-tr ynabtk-header-row inflows">
                  <th class="ynabtk-th">Income</th>
                </tr>
              </thead>
              <tfoot class="ynabtk-tfoot">
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
            </table>
          </div>`
          );

          let $inflowTable = $('.ynabtk-table.inflows');
          // let $outflowTable = $('.ynabtk-table.outflows');

          // fill in the header and the footer first
          dateLabels.forEach((dateLabel, dateIndex) => {
            $('.ynabtk-header-row', $inflowTable).append(`<th>${dateLabel}</th>`);
            let inflowTotal = ynabToolKit.shared.formatCurrency(reportData.totalInflowsByDate[dateIndex]);
            $('.ynabtk-tfoot .ynabtk-tr', $inflowTable).append(`<th>${inflowTotal}</th>`);
          });

          for (let payeeId in reportData.inflowsByPayee) {
            let payeeData = reportData.inflowsByPayee[payeeId];
            let payeeName = payeeData.internalData.get('name');
            let payeeRow = $(`<tr><td>${payeeName}</td></tr>`);

            payeeData.totalByDate.forEach((total) => {
              let payeeDateTotal = ynabToolKit.shared.formatCurrency(total);
              payeeRow.append(`<td>${payeeDateTotal}</td>`);
            });

            $('.ynabtk-tbody', $inflowTable).append(payeeRow);
          }
        }
      };
    }());
  } else {
    setTimeout(poll, 250);
  }
}());
