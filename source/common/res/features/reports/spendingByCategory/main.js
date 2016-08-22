(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    ynabToolKit.spendingByCategory = (function () {
      let colors = ['#c15d5d', '#dc5f7a', '#e87d68', '#f9ad60', '#fcd249', '#f5ea55', '#dce26a'];
      let colorIndex = 0;
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
        reportHeaders() {
          return '';
        },

        calculate(transactions) {
          return new Promise((resolve) => {
            ynab.YNABSharedLib.getBudgetViewModel_CategoriesViewModel().then((categoryViewModel) => {
              transactions.forEach((transaction) => {
                let masterCategoryId = transaction.get('masterCategoryId');
                let subCategoryId = transaction.get('subCategoryId');
                let isTransfer = masterCategoryId === null || subCategoryId === null;
                let internalMasterCategory = categoryViewModel.getMasterCategoryById(masterCategoryId);
                let isInternalYNABCategory = isTransfer ? false :
                                             internalMasterCategory.isDebtPaymentMasterCategory() ||
                                             internalMasterCategory.isHiddenMasterCategory() ||
                                             internalMasterCategory.isInternalMasterCategory();

                // skip all inflow transactions, transfers and internal YNAB categories
                if (transaction.get('inflow') || isTransfer || isInternalYNABCategory) return;

                placeInMasterCategory(transaction, categoryViewModel);
              });

              console.log(reportData);

              resolve();
            });
          });
        },

        createChart($reportsData) {
          $reportsData.css({
            position: 'relative'
          }).append($(
           `<div class="ynab-toolkit-spending-by-cat-chart">
              <canvas id="reportCanvas" width="100" height="100"></canvas>
            </div>
            <div class="ynab-toolkit-category-panel"></div>`
          ));

          let context = document.getElementById('reportCanvas').getContext('2d');

          let masterCategoriesArray = [];
          for (let categoryId in reportData.masterCategories) {
            masterCategoriesArray.push(reportData.masterCategories[categoryId]);
          }

          masterCategoriesArray.sort((a, b) => {
            return a.total - b.total;
          });

          let chartData = {
            labels: [],
            datasets: [{
              data: [],
              label: [],
              backgroundColor: []
            }]
          };

          masterCategoriesArray.forEach((masterCategoryData) => {
            chartData.labels.push(masterCategoryData.internalData.get('name'));
            chartData.datasets[0].data.push(masterCategoryData.total);
            chartData.datasets[0].label.push(masterCategoryData.internalData.get('name'));
            chartData.datasets[0].backgroundColor.push(getColor());
          });

          ynabToolKit.spendingByCategory.chart = new Chart(context, {
            type: 'doughnut',
            data: chartData,
            options: {
              responsive: true,
              rotation: 90 * Math.PI,
              legend: {
                display: false
              }
            }
          });

          ynabToolKit.reports.updateCanvasSize();
        },

        updateReportWithDataFilter() {

        }
      };
    }());
  } else {
    setTimeout(poll, 250);
  }
}());
