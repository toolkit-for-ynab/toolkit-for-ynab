(function poll() {
  if (typeof ynabToolKit !== 'undefined' && typeof Highcharts !== 'undefined') {
    ynabToolKit.spendingByCategory = (function () {
      let colors = ['#ea5439', '#f3ad51', '#ebe598', '#74a9e6', '#c8df68', '#8ba157', '#91c5b4', '#009dae', '#cbdb3c'];
      let reportData = {
        masterCategories: {}
      };

      function placeInSubCategory(transaction, masterCategoryData, categoryViewModel) {
        let subCategoryId = transaction.get('subCategoryId');
        let subCategoryData = masterCategoryData.subCategories[subCategoryId];

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

      function placeInMasterCategory(transaction, categoryViewModel) {
        let masterCategoryId = transaction.get('masterCategoryId');
        let masterCategoryData = reportData.masterCategories[masterCategoryId];

        if (typeof masterCategoryData === 'undefined') {
          reportData.masterCategories[masterCategoryId] = {
            internalData: categoryViewModel.getMasterCategoryById(masterCategoryId),
            subCategories: {},
            total: 0
          };

          masterCategoryData = reportData.masterCategories[masterCategoryId];
        }
        masterCategoryData.total += transaction.get('outflow');
        placeInSubCategory(transaction, masterCategoryData, categoryViewModel);
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
          let internalMasterCategory = categoriesViewModel.getMasterCategoryById(masterCategoryId);
          let isInternalYNABCategory = isTransfer ? false :
                                       internalMasterCategory.isDebtPaymentMasterCategory() ||
                                       // internalMasterCategory.isHiddenMasterCategory() ||
                                       internalMasterCategory.isInternalMasterCategory();

          return !transaction.get('inflow') && !isTransfer && !isInternalYNABCategory;
        },

        calculate(transactions) {
          reportData.masterCategories = {};

          return new Promise((resolve) => {
            ynab.YNABSharedLib.getBudgetViewModel_CategoriesViewModel().then((categoryViewModel) => {
              transactions.forEach((transaction) => {
                placeInMasterCategory(transaction, categoryViewModel);
              });

              resolve();
            });
          });
        },

        createChart($reportsData) {
          $reportsData.css({
            display: 'inline-flex'
          }).html($(
           `<div class="ynabtk-spending-by-cat-chart-container">
              <div id="report-chart" style="position: relative; height: 100%"></div>
            </div>
            <div class="ynabtk-category-panel"></div>`
          ));

          let masterCategoriesArray = [];
          for (let categoryId in reportData.masterCategories) {
            masterCategoriesArray.push(reportData.masterCategories[categoryId]);
          }

          // sort data descending
          masterCategoriesArray.sort((a, b) => {
            return b.total - a.total;
          });

          let chartData = [];
          let totalSpending = 0;
          let otherCategories = {
            name: 'All Other Categories',
            y: 0,
            color: '#696a69'
          };

          masterCategoriesArray.forEach(function (masterCategoryData, index) {
            totalSpending += masterCategoryData.total;

            // the 10th data element will get grouped into "all other transactions"
            if (chartData.length < 9) {
              chartData.unshift({
                name: masterCategoryData.internalData.get('name'),
                y: masterCategoryData.total,
                color: colors[index]
              });
            } else {
              otherCategories.y += masterCategoryData.total;
            }
          });

          if (otherCategories.y) {
            chartData.unshift(otherCategories);
          }

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
