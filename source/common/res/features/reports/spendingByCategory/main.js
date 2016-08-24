(function poll() {
  if (typeof ynabToolKit !== 'undefined' && typeof Highcharts !== 'undefined') {
    ynabToolKit.spendingByCategory = (function () {
      let categories;
      let colorIndex = 0;
      let colors = ['#c15d5d', '#dc5f7a', '#e87d68', '#f9ad60', '#fcd249', '#f5ea55', '#dce26a'];
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

      function getColor() {
        if (typeof colors[colorIndex] === 'undefined') {
          colorIndex = 0;
        }

        return colors[colorIndex++];
      }

      return {
        availableAccountTypes: 'onbudget',
        reportHeaders() {
          return '';
        },

        filterTransaction(transaction) {
          let masterCategoryId = transaction.get('masterCategoryId');
          let subCategoryId = transaction.get('subCategoryId');
          let isTransfer = masterCategoryId === null || subCategoryId === null;
          let internalMasterCategory = categories.getMasterCategoryById(masterCategoryId);
          let isInternalYNABCategory = isTransfer ? false :
                                       internalMasterCategory.isDebtPaymentMasterCategory() ||
                                       internalMasterCategory.isHiddenMasterCategory() ||
                                       internalMasterCategory.isInternalMasterCategory();

          return !transaction.get('inflow') && !isTransfer && !isInternalYNABCategory;
        },

        calculate(transactions) {
          reportData.masterCategories = {};

          return new Promise((resolve) => {
            ynab.YNABSharedLib.getBudgetViewModel_CategoriesViewModel().then((categoryViewModel) => {
              categories = categoryViewModel;
              transactions.forEach((transaction) => {
                placeInMasterCategory(transaction, categoryViewModel);
              });

              resolve();
            });
          });
        },

        createChart($reportsData) {
          colorIndex = 0;

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

          masterCategoriesArray.sort((a, b) => {
            return a.total - b.total;
          });

          let chartData = [];

          masterCategoriesArray.forEach((masterCategoryData) => {
            chartData.push({
              name: masterCategoryData.internalData.get('name'),
              y: masterCategoryData.total,
              color: getColor()
            });
          });

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
              formatter: function () {
                return 'Total: ' + ynabToolKit.shared.formatCurrency(this.y) + '<br>' +
                       'Percentage: ' + Math.round(this.percentage) + '%';
              }
            },
            series: [{
              name: 'Total Spending',
              data: chartData,
              size: '80%',
              innerSize: '50%'
            }]
          });
        }
      };
    }());
  } else {
    setTimeout(poll, 250);
  }
}());
