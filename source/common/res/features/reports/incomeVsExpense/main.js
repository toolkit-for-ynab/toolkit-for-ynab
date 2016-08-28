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

        // update the master category total
        let subCategoryTotal = subCategoryData.totalByDate[subCategoryData.totalByDate.length - 1];
        subCategoryTotal += transaction.get('outflow');
        subCategoryData.totalByDate[subCategoryData.totalByDate.length - 1] = subCategoryTotal;

        // update the master category average
        let subCategoryAverage = subCategoryData.totalByDate[subCategoryData.totalByDate.length - 2];
        subCategoryAverage = subCategoryTotal / (subCategoryData.totalByDate.length - 2);
        subCategoryData.totalByDate[subCategoryData.totalByDate.length - 2] = subCategoryAverage;
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

        // update the report data total objects (by date/total all dates)
        reportData.totalOutflowsByDate[dateIndex] += transaction.get('outflow');
        reportData.totalOutflowsByDate[masterCategoryData.totalByDate.length - 1] += transaction.get('outflow');

        masterCategoryData.totalByDate[dateIndex] += transaction.get('outflow');

        // update the master category total
        let masterCategoryTotal = masterCategoryData.totalByDate[masterCategoryData.totalByDate.length - 1];
        masterCategoryTotal += transaction.get('outflow');
        masterCategoryData.totalByDate[masterCategoryData.totalByDate.length - 1] = masterCategoryTotal;

        // update the master category average
        let masterCategoryAverage = masterCategoryData.totalByDate[masterCategoryData.totalByDate.length - 2];
        masterCategoryAverage = masterCategoryTotal / (masterCategoryData.totalByDate.length - 2);
        masterCategoryData.totalByDate[masterCategoryData.totalByDate.length - 2] = masterCategoryAverage;

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

        // update the report data total objects (by date/total all dates)
        reportData.totalInflowsByDate[dateIndex] += transaction.get('inflow');
        reportData.totalInflowsByDate[payeeData.totalByDate.length - 1] += transaction.get('inflow');

        payeeData.totalByDate[dateIndex] += transaction.get('inflow');

        // update the payee total
        let payeeTotal = payeeData.totalByDate[payeeData.totalByDate.length - 1];
        payeeTotal += transaction.get('inflow');
        payeeData.totalByDate[payeeData.totalByDate.length - 1] = payeeTotal;

        // update the average
        let payeeAverage = payeeData.totalByDate[payeeData.totalByDate.length - 2];
        payeeAverage = payeeTotal / (payeeData.totalByDate.length - 2);
        payeeData.totalByDate[payeeData.totalByDate.length - 2] = payeeAverage;
      }

      return {
        availableAccountTypes: 'onbudget',
        reportHeaders() {
          return '';
        },

        filterTransaction(transaction) {
          let categoriesViewModel = ynab.YNABSharedLib.getBudgetViewModel_CategoriesViewModel()._result;
          let masterCategoryId = transaction.get('masterCategoryId');
          let subCategoryId = transaction.get('subCategoryId');
          let isTransfer = masterCategoryId === null || subCategoryId === null;
          let ynabCategory = categoriesViewModel.getMasterCategoryById(masterCategoryId);
          let isInternalDebtCategory = isTransfer ? false : ynabCategory.isDebtPaymentMasterCategory();
          // let isInternalMasterCategory = isTransfer ? false : ynabCategory.isInternalMasterCategory();
          // let isPositiveStartingBalance = transaction.get('inflow') && isInternalMasterCategory;

          return !transaction.get('isSplit') && !isTransfer && !isInternalDebtCategory;// && isPositiveStartingBalance;// && !isPositiveStartingBalance;
        },

        calculate(transactions) {
          return new Promise((resolve) => {
            // grab the categories from ynab's shared lib with their promise -- we can trust it.
            ynab.YNABSharedLib.getBudgetViewModel_CategoriesViewModel().then((categoryViewModel) => {
              ynab.YNABSharedLib.getBudgetViewModel_PayeesViewModel().then((payeeViewModel) => {
                // make sure the data is empty before we start doing an calculating/data layout stuff
                dateLabels = ynabToolKit.reports.generateMonthLabelsFromFirstTransaction(transactions, true);
                dateLabels.push('Average', 'Total');

                // create the inflow by payee object and total array object
                reportData.inflowsByPayee = {};
                reportData.totalInflowsByDate = generateInitialDataArray();

                // create the outflow by category object and total array object
                reportData.outflowsByCategory = {};
                reportData.totalOutflowsByDate = generateInitialDataArray();

                // for each transaction, add it to the payee or category based on it's amount (negative v. positive)
                transactions.forEach((transaction) => {
                  if (transaction.getAmount() > 0) {
                    placeInPayee(transaction, reportData.inflowsByPayee, payeeViewModel);
                  } else {
                    placeInMasterCategory(transaction, reportData.outflowsByCategory, categoryViewModel);
                  }
                });

                // divide the total by the amount of dates to get our average
                reportData.totalInflowsByDate[dateLabels.length - 2] =
                  reportData.totalInflowsByDate[dateLabels.length - 1] / (dateLabels.length - 2);

                reportData.totalOutflowsByDate[dateLabels.length - 2] =
                  reportData.totalOutflowsByDate[dateLabels.length - 1] / (dateLabels.length - 2);

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
              <i id="expand-collapse-all" title="Expand/Collapse All" class="flaticon stroke expand-vertically"></i>
              <table class="ynabtk-table inflows">
                <thead>
                  <tr class="ynabtk-tr ynabtk-header-row">
                    <th class="ynabtk-th col-title">Income</th>
                  </tr>
                </thead>
                <tfoot class="ynabtk-tfoot">
                  <tr class="ynabtk-tr ynabtk-footer-row">
                    <th class="ynabtk-th col-title">Total Income</th>
                  </tr>
                </tfoot>
                <tbody class="ynabtk-tbody">
                </tbody>
              </table>

              <table class="ynabtk-table outflows">
                <thead>
                  <tr class="ynabtk-tr ynabtk-header-row">
                    <th class="ynabtk-th col-title">Expenses</th>
                  </tr>
                </thead>
                <tfoot class="ynabtk-tfoot">
                  <tr class="ynabtk-tr ynabtk-footer-row">
                    <th class="ynabtk-th col-title">Total Expenses</th>
                  </tr>
                </tfoot>
                <tbody class="ynabtk-tbody">
                </tbody>
              </table>

              <table class="ynabtk-table net-income">
                <thead>
                  <tr class="ynabtk-tr ynabtk-header-row">
                    <th class="ynabtk-th col-title">Net Income</th>
                  </tr>
                </thead>
              </table>
            </div>`
          );

          let $inflowTable = $('.ynabtk-table.inflows');
          let $outflowTable = $('.ynabtk-table.outflows');
          let $netIncomeTable = $('.ynabtk-table.net-income');

          // create the "toggle" row
          let allPayeesToggleRow = $(
            `<tr class="expandable-toggle" id="all-payees">
              <td class="col-title master-category" title="All Income Sources">
                <i class="flaticon stroke up"></i>
                All Income Sources
              </td>
            </tr>
          `);

          // create the "summary" row which will show only when expanded
          let allPayeesTotalRow = $(
            `<tr class="expandable-row summary-row" data-expand-for="all-payees">
              <td class="col-title master-category">Total All Income Resources</td>
            </tr>
          `);

          // First, fill in the "total" numbers. All payees are rolled up into one "All Income Sources" row
          // so do those while filling the header/footer.
          dateLabels.forEach((dateLabel, dateIndex) => {
            let inflow = reportData.totalInflowsByDate[dateIndex];
            let outflow = reportData.totalOutflowsByDate[dateIndex];
            let netIncome = inflow - outflow;
            let inflowFormatted = ynabToolKit.shared.formatCurrency(inflow);
            let outflowFormatted = ynabToolKit.shared.formatCurrency(-outflow);
            let netIncomeFormatted = ynabToolKit.shared.formatCurrency(netIncome);

            // inflow table header/footer
            $('.ynabtk-header-row', $inflowTable).append(`<th class="col-data">${dateLabel}</th>`);
            $('.ynabtk-tfoot .ynabtk-tr', $inflowTable).append(`<th class="col-data">${inflowFormatted}</th>`);

            // inflow table toggle/summary row
            allPayeesToggleRow.append(`<td class="col-data">${inflowFormatted}</td>`);
            allPayeesTotalRow.append(`<td class="col-data">${inflowFormatted}</td>`);

            // outflow table header/footer
            $('.ynabtk-header-row', $outflowTable).append(`<th class="col-data">${dateLabel}</th>`);
            $('.ynabtk-tfoot .ynabtk-tr', $outflowTable).append(`<th class="col-data">${outflowFormatted}</th>`);

            // net-income table
            $('.ynabtk-header-row', $netIncomeTable).append(`<th class="col-data">${netIncomeFormatted}</th>`);
          });

          // add the toggle row for the payees first
          $('.ynabtk-tbody', $inflowTable).append(allPayeesToggleRow);

          // add all the payee rows next
          for (let payeeId in reportData.inflowsByPayee) {
            let payeeData = reportData.inflowsByPayee[payeeId];
            let payeeName = payeeData.internalData.get('name');
            let payeeRow = $(
              `<tr class="expandable-row" data-expand-for="all-payees">
                <td class="col-title payee-name" title="${payeeName}">${payeeName}</td>
              </tr>`);

            payeeData.totalByDate.forEach((total) => {
              let payeeDateTotal = ynabToolKit.shared.formatCurrency(total);
              payeeRow.append(`<td class="col-data">${payeeDateTotal}</td>`);
            });

            $('.ynabtk-tbody', $inflowTable).append(payeeRow);
          }

          // finish building the payee table with the summary row (shown on expand)
          $('.ynabtk-tbody', $inflowTable).append(allPayeesTotalRow);

          /*
          *******************************************
          * OUTFLOW TABLE SECOND!
          ********************************************
          */

          // the categories should be ordered in the way they are in the budget screen, thankfully
          // each category has 'sortableIndex' property. great work YNAB team! :D
          let masterCategoriesArray = [];
          for (let masterCategoryId in reportData.outflowsByCategory) {
            let masterCategoryData = reportData.outflowsByCategory[masterCategoryId];
            masterCategoryData.subCategoriesArray = [];

            // subCategories shall have the sort as well!! go team!
            for (let subCategoryId in masterCategoryData.subCategories) {
              let subCategoryData = masterCategoryData.subCategories[subCategoryId];
              masterCategoryData.subCategoriesArray.push(subCategoryData);
            }

            // first, sort the sub categories
            masterCategoryData.subCategoriesArray.sort((a, b) =>
              a.internalData.get('sortableIndex') - b.internalData.get('sortableIndex'));

            masterCategoriesArray.push(masterCategoryData);
          }

          masterCategoriesArray.sort((a, b) =>
            a.internalData.get('sortableIndex') - b.internalData.get('sortableIndex'));

          // now that everything is sorted, go ahead and lay out the expense table
          masterCategoriesArray.forEach((masterCategoryData) => {
            // get the data for the current master category row
            let masterCategoryId = masterCategoryData.internalData.get('entityId');
            let masterCategoryName = masterCategoryData.internalData.get('name');

            // create the "toggle" row
            let masterCategoryToggleRow = $(
              `<tr class="expandable-toggle" id="${masterCategoryId}">
                <td class="col-title master-category" title="${masterCategoryName}">
                  <i class="flaticon stroke up"></i>
                  ${masterCategoryName}
                </td>
              </tr>
            `);

            // create the "summary" row which will show only when expanded
            let masterCategoryTotalRow = $(
              `<tr class="expandable-row summary-row" data-expand-for="${masterCategoryId}">
                <td class="col-title master-category">Total ${masterCategoryName}</td>
              </tr>
            `);

            // add the totals to both the toggle and the total row
            masterCategoryData.totalByDate.forEach((total) => {
              let masterCategoryDateTotal = ynabToolKit.shared.formatCurrency(-total);
              masterCategoryToggleRow.append(`<td class="col-data">${masterCategoryDateTotal}</td>`);
              masterCategoryTotalRow.append(`<td class="col-data">${masterCategoryDateTotal}</td>`);
            });

            // add the toggle row to the table before the sub categories
            $('.ynabtk-tbody', $outflowTable).append(masterCategoryToggleRow);

            // loop throw each subcategory and add them to underneath the toggle row.
            masterCategoryData.subCategoriesArray.forEach((subCategoryData) => {
              let subCategoryName = subCategoryData.internalData.get('name');
              let subCategoryRow = $(
                // default the subcategory row as display: none
                `<tr class="expandable-row" data-expand-for="${masterCategoryId}"><td class="col-title sub-category">${subCategoryName}</td></tr>`
              );

              subCategoryData.totalByDate.forEach((total) => {
                let subCategoryDateTotal = ynabToolKit.shared.formatCurrency(-total);
                subCategoryRow.append(`<td class="col-data">${subCategoryDateTotal}</td>`);
              });

              $('.ynabtk-tbody', $outflowTable).append(subCategoryRow);
            });

            // finally add the total summary row.
            $('.ynabtk-tbody', $outflowTable).append(masterCategoryTotalRow);
          });

          // this is some crazy cool stuff that I'm a little over-excited about but basically if a
          // row has a "expandable-toggle" class then, when it's clicked it will apply the "expanded"
          // class to all elements that have its' id in their data-expand-for field. swag.
          $('.expandable-toggle').click(function () {
            let isExpanded = $(this).hasClass('expanded');

            if (isExpanded) {
              expandOrCollapse.call(this, false);
            } else {
              expandOrCollapse.call(this, true);
            }
          });

          let allExpanded = false;
          $('#expand-collapse-all').click(function () {
            allExpanded = !allExpanded;
            $('.expandable-toggle').each(function () {
              expandOrCollapse.call(this, allExpanded);
            });
          });

          function expandOrCollapse(expand) {
            let idToExpand = $(this).attr('id');

            if (expand) {
              $(this).addClass('expanded');
              $('.flaticon', this).removeClass('up');
              $('.flaticon', this).addClass('down');
              $(`*[data-expand-for="${idToExpand}"]`).addClass('expanded');
            } else {
              $(this).removeClass('expanded');
              $('.flaticon', this).removeClass('down');
              $('.flaticon', this).addClass('up');
              $(`*[data-expand-for="${idToExpand}"]`).removeClass('expanded');
            }
          }
        }
      };
    }());
  } else {
    setTimeout(poll, 250);
  }
}());
