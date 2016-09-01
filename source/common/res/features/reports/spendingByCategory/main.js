(function poll() {
  if (typeof ynabToolKit !== 'undefined' && typeof Highcharts !== 'undefined') {
    ynabToolKit.spendingByCategory = (function () {
      let colors = ['#ea5439', '#f3ad51', '#ebe598', '#74a9e6', '#c8df68', '#8ba157', '#91c5b4', '#009dae', '#cbdb3c'];
      let reportData = {
        masterCategories: {}
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

        // push the transaction and increment the total. storing the transaction just because
        // we might want it for the drilldown stuff. not certain yet.
        subCategoryData.transactions.push(transaction);
        subCategoryData.total += -(transaction.getAmount());
      }

      function placeInMasterCategory(transaction, categoryViewModel) {
        // grab the master category date from our master category object
        let masterCategoryId = transaction.get('masterCategoryId');
        let internalData = categoryViewModel.getMasterCategoryById(masterCategoryId);

        if (internalData.isInternalMasterCategory()) {
          let hiddenMasterCategory = categoryViewModel.get('hiddenMasterCategory');
          masterCategoryId = hiddenMasterCategory.get('entityId');
          internalData = hiddenMasterCategory;
        }

        let masterCategoryData = reportData.masterCategories[masterCategoryId];

        // if we haven't created that data yet, then default everything to 0/empty
        if (typeof masterCategoryData === 'undefined') {
          reportData.masterCategories[masterCategoryId] = {
            internalData: categoryViewModel.getMasterCategoryById(masterCategoryId),
            subCategories: {},
            total: 0
          };

          masterCategoryData = reportData.masterCategories[masterCategoryId];
        }

        // increment the total of the category and then call placeInSubCategory so that we can do drilldowns
        masterCategoryData.total += -(transaction.getAmount());
        placeInSubCategory(transaction, masterCategoryData, categoryViewModel);
      }

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

          return !transaction.get('isSplit') &&
                 transaction.getAmount() &&
                 !isTransfer &&
                 !isInternalDebtCategory &&
                 (!isPositiveStartingBalance || !transaction.get('inflow'));
        },

        calculate(transactions) {
          return new Promise((resolve) => {
            // grab the categories from ynab's shared lib with their promise -- we can trust it.
            ynab.YNABSharedLib.getBudgetViewModel_CategoriesViewModel().then((categoryViewModel) => {
              // make sure the data is empty before we start doing an calculating/data layout stuff
              reportData.masterCategories = {};

              transactions.forEach((transaction) => {
                placeInMasterCategory(transaction, categoryViewModel);
              });

              resolve();
            });
          });
        },

        createChart($reportsData) {
          // set up the container for our graph and for our side-panel (the legend)
          $reportsData.css({
            display: 'inline-flex'
          }).html($('<div>', {
            class: 'ynabtk-spending-by-cat-chart-container'
          }).append(
            $('<div>', { id: 'report-chart', css: { position: 'relative', height: '100%' } })
          )).append(
            $('<div>', { class: 'ynabtk-category-panel' })
              .append($('<div>', { class: 'ynabtk-category-entry' })
                .append($('<div>', { class: 'ynabtk-category-entry-name' }).append('Category'))
                .append($('<div>', { class: 'ynabtk-category-entry-amount' }).append('Spending'))
              )
          );

          // store all the categories into an array so we can sort it!
          let masterCategoriesArray = [];
          for (let categoryId in reportData.masterCategories) {
            masterCategoriesArray.push(reportData.masterCategories[categoryId]);
          }

          // sort it! (descending)
          masterCategoriesArray.sort((a, b) => {
            return b.total - a.total;
          });

          // we want to have a separate chartData array because there's only 10 slices in this pie
          let chartData = [];
          let totalSpending = 0;

          // the 10th will be a house for everything not in the top 9 slices...
          let otherCategories = {
            name: 'All Other Categories',
            y: 0,
            color: '#696a69'
          };

          // throw the categories into the chartData FILO style because that's what Highcharts wants.
          masterCategoriesArray.forEach(function (masterCategoryData, index) {
            let categoryName = masterCategoryData.internalData.get('name');
            let categoryTotal = masterCategoryData.total;
            let color = colors[index] || otherCategories.color;
            totalSpending += masterCategoryData.total;

            // the 10th data element will get grouped into "all other transactions"
            if (chartData.length < 9) {
              chartData.unshift({
                name: categoryName,
                y: categoryTotal,
                color: color
              });
            } else {
              otherCategories.y += masterCategoryData.total;
            }

            // also add the category to the legend so users can still see all the data
            $('.ynabtk-category-panel').append(
              $('<div>', {
                class: 'ynabtk-category-entry'
              }).append(
                $('<div>', {
                  class: 'ynabtk-category-entry-name'
                }).append(
                  $('<div>', {
                    class: 'ynabtk-reports-legend-square category-color',
                    css: { 'background-color': color }
                  })
                ).append(document.createTextNode(categoryName))
              )
              .append(
                $('<div>', {
                  class: 'ynabtk-category-entry-amount',
                  text: ynabToolKit.shared.formatCurrency(categoryTotal)
                })
              )
            );
          });

          // if we had enough data for otherCategories, make sure we put it in the chart!
          if (otherCategories.y) {
            chartData.unshift(otherCategories);
          }

          // throw the total into the legend as well so they can see how much money the spend in two places!
          $('.ynabtk-category-panel')
            .append($('<hr>'))
            .append($('<div>', {
              class: 'ynabtk-category-entry'
            }).append($('<div>', {
              class: 'ynabtk-category-entry-name total',
              text: 'Total'
            }))
            .append($('<div>', {
              class: 'ynabtk-category-entry-amount total',
              text: ynabToolKit.shared.formatCurrency(totalSpending)
            }))
          );

          // make that chart!
          ynabToolKit.spendingByCategory.chart = new Highcharts.Chart({
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
