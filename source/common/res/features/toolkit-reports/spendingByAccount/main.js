(function poll() {
  if (typeof ynabToolKit !== 'undefined' && typeof Highcharts !== 'undefined') {
    ynabToolKit.spendingByAccount = (function () {
      let colors = ['#ea5439', '#f3ad51', '#ebe598', '#74a9e6', '#c8df68', '#8ba157', '#91c5b4', '#009dae', '#cbdb3c'];
      let reportData = {
        accounts: {}
      };

      return {
        availableAccountTypes: 'all',
        reportHeaders() {
          return '';
        },

        // custom data filter for our transactions. YNAB has a debt master category and an internal master category
        // the internalMasterCategory contains things like "Split Transaction (Multiple Categories...)" and starting
        // balances. The starting balances that are negative are actually important to this report in order to match YNAB4
        // so make sure we have them in the report here. We ignore any splits, transfers, debt categories, and
        // positive starting balances
        filterTransaction(transaction) {
          // can't use a promise here and the _result *should* if there's anything to worry about,
          // it's this line but im still not worried about it.
          let categoriesViewModel = ynab.YNABSharedLib.getBudgetViewModel_CategoriesViewModel()._result;
          let masterCategoryId = transaction.get('masterCategoryId');
          let subCategoryId = transaction.get('subCategoryId');
          let isTransfer = masterCategoryId === null || subCategoryId === null;
          let ynabCategory = categoriesViewModel.getMasterCategoryById(masterCategoryId);
          let isInternalDebtCategory = isTransfer ? false : ynabCategory.isDebtPaymentMasterCategory();
          let isInternalMasterCategory = isTransfer ? false : ynabCategory.isInternalMasterCategory();
          let isPositiveStartingBalance = transaction.get('inflow') && isInternalMasterCategory;

          return transaction.getAmount() &&
                (
                  (!ynabCategory && transaction.get('outflow')) || // Tracking account transactions: They don't have a category - only include outflows as spending
                  (!transaction.get('isSplit') &&  // See above for on-budget transaction rules
                  !isTransfer &&
                  !isInternalDebtCategory &&
                  (!isPositiveStartingBalance || !transaction.get('inflow'))));
        },

        calculate(transactions) {
          return new Promise((resolve) => {
            // Ensure we're calculating from scratch each time.
            reportData.accounts = {};

            transactions.forEach((transaction) => {
              let accountId = transaction.get('accountId');
              let accountName = transaction.get('accountName');
              let accountObject = reportData.accounts[accountId] || { name: accountName, total: 0, transactions: [] };

              accountObject.total += -(transaction.getAmount());
              accountObject.transactions.push(transaction);

              reportData.accounts[accountId] = accountObject;
            });

            resolve();
          });
        },

        createChart($reportsData) {
          // set up the container for our graph and for our side-panel (the legend)
          $reportsData.css({
            display: 'inline-flex'
          }).html($('<div>', {
            class: 'ynabtk-spending-by-account-chart-container'
          }).append(
            $('<div>', { id: 'report-chart', css: { position: 'relative', height: '100%' } })
          )).append(
            $('<div>', { class: 'ynabtk-account-panel' })
              .append($('<div>', { class: 'ynabtk-account-entry' })
                .append($('<div>', { class: 'ynabtk-account-entry-name' }).append('Category'))
                .append($('<div>', { class: 'ynabtk-account-entry-amount' }).append('Spending'))
              )
          );

          // store all the categories into an array so we can sort it!
          let accountArray = [];
          for (let account in reportData.accounts) {
            accountArray.push(reportData.accounts[account]);
          }

          // sort it! (descending)
          accountArray.sort((a, b) => {
            return b.total - a.total;
          });

          // we want to have a separate chartData array because there's only 10 slices in this pie
          let chartData = [];
          let totalSpending = 0;

          // the 10th will be a house for everything not in the top 9 slices...
          let otherAccounts = {
            name: 'All Other Accounts',
            y: 0,
            color: '#696a69'
          };

          // throw the accounts into the chartData FILO style because that's what Highcharts wants.
          accountArray.forEach(function (accountData, index) {
            let accountName = accountData.name;
            let accountTotal = accountData.total;
            let color = colors[index] || otherAccounts.color;
            totalSpending += accountTotal;

            // the 10th data element will get grouped into "all other accounts"
            if (chartData.length < 9) {
              chartData.unshift({
                name: accountName,
                y: accountTotal,
                color: color
              });
            } else {
              otherAccounts.y += accountTotal;
            }

            // also add the account to the legend so users can still see all the data
            $('.ynabtk-account-panel').append(
              $('<div>', {
                class: 'ynabtk-account-entry'
              }).append(
                $('<div>', {
                  class: 'ynabtk-account-entry-name'
                }).append(
                  $('<div>', {
                    class: 'ynabtk-reports-legend-square account-color',
                    css: { 'background-color': color }
                  })
                ).append(document.createTextNode(accountName))
              )
              .append(
                $('<div>', {
                  class: 'ynabtk-account-entry-amount',
                  text: ynabToolKit.shared.formatCurrency(accountTotal)
                })
              )
            );
          });

          // throw the total into the legend as well so they can see how much money the spend in two places!
          $('.ynabtk-account-panel')
            .append($('<hr>'))
            .append($('<div>', {
              class: 'ynabtk-account-entry'
            }).append($('<div>', {
              class: 'ynabtk-account-entry-name total',
              text: 'Total'
            }))
            .append($('<div>', {
              class: 'ynabtk-account-entry-amount total',
              text: ynabToolKit.shared.formatCurrency(totalSpending)
            }))
          );

          // make that chart!
          ynabToolKit.spendingByAccount.chart = new Highcharts.Chart({
            credits: false,
            chart: {
              type: 'pie',
              renderTo: 'report-chart'
            },
            plotOptions: {
              pie: {
                startAngle: 90
              }
            },
            tooltip: {
              enabled: false
            },
            title: {
              align: 'center',
              verticalAlign: 'middle',
              text: 'Total Spending<br>' + ynabToolKit.shared.formatCurrency(totalSpending)
            },
            series: [{
              name: 'Total Spending',
              data: chartData,
              size: '80%',
              innerSize: '50%',
              dataLabels: {
                formatter: function () {
                  let formattedNumber = ynabToolKit.shared.formatCurrency(this.y);
                  return this.point.name + '<br>' + formattedNumber + ' (' + Math.round(this.percentage) + '%)';
                }
              }
            }]
          });
        }
      };
    }());
  } else {
    setTimeout(poll, 250);
  }
}());
