(function poll() {
  if (typeof ynabToolKit !== 'undefined' && typeof Highcharts !== 'undefined') {
    ynabToolKit.spendingByCategory = (function () {
      let colors = ['#ea5439', '#f3ad51', '#ebe598', '#74a9e6', '#c8df68', '#8ba157', '#91c5b4', '#009dae', '#cbdb3c', '#e4d354', '#8085e9', '#f7a35c', '#a4c0d0', '#7cb5ec', '#c7f6be'];
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

      function updateLegend(data) {
        let legendData = data.data;
        let legendName = data.name;
        let legendTotal = 0;

        $('.ynabtk-category-panel').empty();

        for (var i = legendData.length - 1; i >= 0; i--) {
          legendTotal += legendData[i].y;

          $('.ynabtk-category-panel').append($('<div>', {
            class: 'ynabtk-category-entry'
          }).append($('<div>', {
            class: 'ynabtk-category-entry-name'
          }).append($('<div>', {
            class: 'ynabtk-reports-legend-square category-color',
            css: { 'background-color': legendData[i].color }
          })).append(document.createTextNode(legendData[i].name)))
            .append($('<div>', {
              class: 'ynabtk-category-entry-amount',
              text: ynabToolKit.shared.formatCurrency(legendData[i].y)
            })));
        }

        $('.ynabtk-category-panel')
          .append($('<hr>'))
          .append($('<div>', {
            class: 'ynabtk-category-entry'
          }).append($('<div>', {
            class: 'ynabtk-category-entry-name total',
            text: legendName
          }))
            .append($('<div>', {
              class: 'ynabtk-category-entry-amount total',
              text: ynabToolKit.shared.formatCurrency(legendTotal)
            })));
      }

      function showCategoryTransactions(event, category, transactions) {
        const budgetController = ynabToolKit.shared.containerLookup('controller:budget');
        const displayItemsCollection = ynabToolKit.shared.containerLookup('controller:application').get('budgetViewModel.budgetMonthDisplayItemsCollection');
        const subCategoryDisplayItem = displayItemsCollection.findItemByCategoryId(category.get('entityId'));

        budgetController.setProperties({
          selectedActivityCategory: subCategoryDisplayItem,
          selectedActivityTransactions: transactions
        });

        const modalOptions = {
          triggerElement: $('#report-chart'),
          controller: 'budget',
          offset: {
            y: event.chartY,
            x: event.chartX
          }
        };

        budgetController.send('openModal', 'modals/budget/activity', modalOptions);
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
          const isTransfer = transaction.getIsOnBudgetTransfer();
          const categoriesViewModel = ynabToolKit.shared.containerLookup('controller:application').get('categoriesViewModel');
          const masterCategoryId = transaction.get('masterCategoryId');
          const masterCategory = categoriesViewModel.getMasterCategoryById(masterCategoryId);
          const isInternalDebtCategory = !masterCategory ? false : masterCategory.isDebtPaymentMasterCategory();

          return (
            !!masterCategory &&
            transaction.getAmount() &&
            !transaction.get('isSplit') &&
            !isTransfer &&
            !isInternalDebtCategory &&
            !masterCategory.isInternalMasterCategory()
          );
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
          })
            .html($('<div>', { class: 'ynabtk-spending-by-cat-chart-container' })
              .append($('<div>', { id: 'report-chart', css: { position: 'relative', height: '100%' } })))
            .append($('<div>', { class: 'ynabtk-category-panel' })
              .append($('<div>', { class: 'ynabtk-category-entry' })
                .append($('<div>', { class: 'ynabtk-category-entry-name' }).append('Category'))
                .append($('<div>', { class: 'ynabtk-category-entry-amount' }).append('Spending'))));

          // store all the categories into an array so we can sort it!
          let masterCategoriesArray = [];
          for (let masterCategoryId in reportData.masterCategories) {
            let masterCategoryData = reportData.masterCategories[masterCategoryId];
            let subCategoryArray = [];

            for (let subCategoryId in masterCategoryData.subCategories) {
              subCategoryArray.push(masterCategoryData.subCategories[subCategoryId]);
            }

            // sort it descending
            subCategoryArray.sort((a, b) => {
              return b.total - a.total;
            });

            masterCategoryData.subCategoryArray = subCategoryArray;
            masterCategoriesArray.push(masterCategoryData);
          }

          // sort it! (descending)
          masterCategoriesArray.sort((a, b) => {
            return b.total - a.total;
          });

          // we want to have a separate chartData array because there's only 10 slices in this pie
          let chartData = [];
          let drilldownData = [];
          let totalSpending = 0;

          // the 10th will be a house for everything not in the top 9 slices...
          let otherCategories = {
            name: 'All Other Categories',
            y: 0,
            color: '#696a69',
            drilldown: null
          };

          // throw the categories into the chartData FILO style because that's what Highcharts wants.
          masterCategoriesArray.forEach((masterCategoryData, index) => {
            let masterCategoryId = masterCategoryData.internalData.get('entityId');
            let masterCategoryName = masterCategoryData.internalData.get('name');
            let masterCategoryTotal = masterCategoryData.total;
            let color = colors[index];
            totalSpending += masterCategoryData.total;

            // the 15th data element will get grouped into "all other transactions"
            if (chartData.length < 14) {
              chartData.unshift({
                name: masterCategoryName,
                y: masterCategoryTotal,
                color: color,
                drilldown: masterCategoryId
              });
            } else {
              otherCategories.y += masterCategoryData.total;
            }

            let masterCategoryDrillDown = {
              name: masterCategoryName,
              id: masterCategoryId,
              size: '80%',
              innerSize: '50%',
              data: []
            };

            masterCategoryData.subCategoryArray.forEach((subCategoryData, subCatIndex) => {
              let categoryName = subCategoryData.internalData.isImmediateIncomeCategory() ? 'Negative Starting Balances' :
                subCategoryData.internalData.get('name');

              masterCategoryDrillDown.data.unshift({
                name: categoryName,
                y: subCategoryData.total,
                color: colors[subCatIndex % colors.length],
                transactions: subCategoryData.transactions,
                events: {
                  click: function (event) {
                    showCategoryTransactions(event, subCategoryData.internalData, this.transactions);
                  }
                }
              });
            });

            drilldownData.push(masterCategoryDrillDown);
          });

          // if we had enough data for otherCategories, make sure we put it in the chart!
          if (otherCategories.y) {
            chartData.unshift(otherCategories);
          }

          // make that chart!
          const chart = {
            credits: false,
            chart: {
              type: 'pie',
              events: {
                drilldown: function (e) {
                  this.setTitle({
                    text: e.point.name + '<br>' + ynabToolKit.shared.formatCurrency(e.point.y)
                  });

                  // e points to the clicked category point, seriesOptions has all the data for the drilldown
                  updateLegend(e.seriesOptions);
                },
                drillup: function () {
                  this.setTitle({
                    text: 'Total Spending<br>' + ynabToolKit.shared.formatCurrency(totalSpending)
                  });

                  updateLegend({
                    name: 'Total Spending',
                    data: chartData
                  });
                },
                load: function () {
                  updateLegend({
                    name: 'Total Spending',
                    data: chartData
                  });
                }
              }
            },
            plotOptions: {
              pie: {
                startAngle: 90
              },
              series: {
                dataLabels: {
                  formatter: function () {
                    let formattedNumber = ynabToolKit.shared.formatCurrency(this.y);
                    return this.point.name + '<br>' + formattedNumber + ' (' + Math.round(this.percentage) + '%)';
                  }
                }
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
              innerSize: '50%'
            }],
            drilldown: {
              series: drilldownData
            }
          };

          ynabToolKit.spendingByCategory.chart = new Highcharts.Chart('report-chart', chart);
        }
      };
    }());
  } else if (typeof Ember !== 'undefined') {
    Ember.run.next(poll, 250);
  } else {
    setTimeout(poll, 250);
  }
}());
