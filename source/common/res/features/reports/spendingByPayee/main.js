(function poll() {
  if (typeof ynabToolKit !== 'undefined' && typeof Highcharts !== 'undefined') {
    ynabToolKit.spendingByPayee = (function () {
      let colors = ['#ea5439', '#f3ad51', '#ebe598', '#74a9e6', '#c8df68', '#8ba157', '#91c5b4', '#009dae', '#cbdb3c'];
      let reportData = {
        payees: {}
      };

      return {
        availableAccountTypes: 'onbudget',
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

          return transaction.payeeName.length > 0 &&
                 transaction.getAmount() &&
                 !transaction.get('isSplit') &&
                 !isTransfer &&
                 !isInternalDebtCategory &&
                 (!isPositiveStartingBalance || !transaction.get('inflow'));
        },

        calculate(transactions) {
          // Ensure we're calculating from scratch each time.
          reportData.payees = {};

          return new Promise((resolve) => {
            // Bucket the transactions by payee
            transactions.forEach((transaction) => {
              let payeeObject = reportData.payees[transaction.payeeName] || { name: transaction.payeeName, total: 0, transactions: [] };

              payeeObject.total += -(transaction.getAmount());
              payeeObject.transactions.push(transaction);

              reportData.payees[transaction.payeeName] = payeeObject;
            });

            resolve();
          });
        },

        createChart($reportsData) {
          // set up the container for our graph and for our side-panel (the legend)
          $reportsData.css({
            display: 'inline-flex'
          }).html($('<div>', {
            class: 'ynabtk-spending-by-payee-chart-container'
          }).append(
            $('<div>', { id: 'report-chart', css: { position: 'relative', height: '100%' } })
          )).append(
            $('<div>', { class: 'ynabtk-payee-panel' })
              .append($('<div>', { class: 'ynabtk-payee-entry' })
                .append($('<div>', { class: 'ynabtk-payee-entry-name' }).append('Category'))
                .append($('<div>', { class: 'ynabtk-payee-entry-amount' }).append('Spending'))
              )
          );

          // store all the categories into an array so we can sort it!
          let payeeArray = [];
          for (let payee in reportData.payees) {
            payeeArray.push(reportData.payees[payee]);
          }

          // sort it! (descending)
          payeeArray.sort((a, b) => {
            return b.total - a.total;
          });

          // we want to have a separate chartData array because there's only 10 slices in this pie
          let chartData = [];
          let totalSpending = 0;

          // the 10th will be a house for everything not in the top 9 slices...
          let otherPayees = {
            name: 'All Other Payees',
            y: 0,
            color: '#696a69'
          };

          // throw the payees into the chartData FILO style because that's what Highcharts wants.
          payeeArray.forEach(function (payeeData, index) {
            let payeeName = payeeData.name;
            let payeeTotal = payeeData.total;
            let color = colors[index] || otherPayees.color;
            totalSpending += payeeTotal;

            // the 10th data element will get grouped into "all other payees"
            if (chartData.length < 9) {
              chartData.unshift({
                name: payeeName,
                y: payeeTotal,
                color: color
              });
            } else {
              otherPayees.y += payeeTotal;
            }

            // also add the payee to the legend so users can still see all the data
            $('.ynabtk-payee-panel').append(
              $('<div>', {
                class: 'ynabtk-payee-entry'
              }).append(
                $('<div>', {
                  class: 'ynabtk-payee-entry-name'
                }).append(
                  $('<div>', {
                    class: 'ynabtk-reports-legend-square payee-color',
                    css: { 'background-color': color }
                  })
                ).append(document.createTextNode(payeeName))
              )
              .append(
                $('<div>', {
                  class: 'ynabtk-payee-entry-amount',
                  text: ynabToolKit.shared.formatCurrency(payeeTotal)
                })
              )
            );
          });

          // if we had enough data for otherPayees, make sure we put it in the chart!
          if (otherPayees.y) {
            chartData.unshift(otherPayees);
          }

          // throw the total into the legend as well so they can see how much money the spend in two places!
          $('.ynabtk-payee-panel')
            .append($('<hr>'))
            .append($('<div>', {
              class: 'ynabtk-payee-entry'
            }).append($('<div>', {
              class: 'ynabtk-payee-entry-name total',
              text: 'Total'
            }))
            .append($('<div>', {
              class: 'ynabtk-payee-entry-amount total',
              text: ynabToolKit.shared.formatCurrency(totalSpending)
            }))
          );

          // make that chart!
          ynabToolKit.spendingByPayee.chart = new Highcharts.Chart({
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
