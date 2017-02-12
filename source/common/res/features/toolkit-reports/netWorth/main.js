/* eslint-disable no-multi-str */

(function poll() {
  if (typeof ynabToolKit !== 'undefined' && typeof Highcharts !== 'undefined') {
    let reportData = {
      labels: [],
      assets: [],
      liabilities: [],
      netWorths: []
    };

    ynabToolKit.netWorthReport = (function () {
      function setHeaderValues(pointIndex) {
        let series = ynabToolKit.netWorthReport.chart.series;
        series.forEach((seriesData, index) => {
          let formattedCurrency = ynabToolKit.shared.formatCurrency(seriesData.data[pointIndex].y);
          if (index === 0) {
            seriesData.data[pointIndex].setState('hover');
            $('#net-worth-report-debts').text(formattedCurrency);
          }

          if (index === 1) {
            seriesData.data[pointIndex].setState('hover');
            $('#net-worth-report-assets').text(formattedCurrency);
          }

          if (index === 2) {
            seriesData.data[pointIndex].setState('hover');
            $('#net-worth-report-net-worth').text(formattedCurrency);
          }
        });
      }

      function onMouseOut(pointIndex) {
        ynabToolKit.netWorthReport.chart.series.forEach((seriesData) => {
          seriesData.data[pointIndex].setState('');
        });
      }

      return {
        availableAccountTypes: 'all',
        ignoreDateFilter: true,
        reportHeaders() {
          return '<div class="ynabtk-net-worth-header"> \
                    <div class="ynabtk-net-worth-header-detail"> \
                      <div class="ynabtk-reports-legend-square debts"></div> \
                      <span class="ynabtk-net-worth-header-heading">' +
                      ((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.debts']) || 'Debts') + '</span> \
                      <span id="net-worth-report-debts" class="ynabtk-net-worth-header-value currency"></span> \
                    </div> \
                    <div class="ynabtk-net-worth-header-divider"></div> \
                    <div class="ynabtk-net-worth-header-detail"> \
                      <div class="ynabtk-reports-legend-square assets"></div> \
                      <span class="ynabtk-net-worth-header-heading">' +
                      ((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.assets']) || 'Assets') + '</span> \
                      <span id="net-worth-report-assets" class="ynabtk-net-worth-header-value currency"></span> \
                    </div> \
                    <div class="ynabtk-net-worth-header-divider"></div> \
                    <div class="ynabtk-net-worth-header-detail"> \
                      <div class="ynabtk-reports-legend-line net-worth"></div> \
                      <span class="ynabtk-net-worth-header-heading">' +
                      ((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.netWorth']) || 'Net Worth') + '</span> \
                      <span id="net-worth-report-net-worth" class="ynabtk-net-worth-header-value currency"></span> \
                    </div> \
                  </div>';
        },

        filterTransaction(transaction) {
          return transaction.get('displayItemType') === 'transaction';
        },

        calculate(transactions) {
          return new Promise((resolve) => {
            reportData.labels.length = 0;
            reportData.assets.length = 0;
            reportData.liabilities.length = 0;
            reportData.netWorths.length = 0;

            const balanceByAccount = {};
            let lastLabel = null;
            let formattedDate = null;

            // Go through all transactions and get balances of the accounts each month
            // Net worth is calculated by dictating the entire account as either an asset
            // or a liability, then totalling up those values for the month.
            for (const transaction of transactions) {
              formattedDate = ynabToolKit.reports.formatTransactionDatel8n(transaction);

              if (lastLabel === null) {
                lastLabel = formattedDate;
              }

              // We're on the next month, push a new label
              if (formattedDate !== lastLabel) {
                reportData.labels.push(lastLabel);

                let totalAssets = 0;
                let totalLiabilities = 0;

                for (let account of Object.keys(balanceByAccount)) {
                  if (balanceByAccount[account] > 0) {
                    totalAssets += balanceByAccount[account];
                  } else {
                    totalLiabilities -= balanceByAccount[account];
                  }
                }

                reportData.assets.push(totalAssets);
                reportData.liabilities.push(totalLiabilities);
                reportData.netWorths.push(totalAssets - totalLiabilities);

                lastLabel = formattedDate;
              }

              const accountName = transaction.getAccountName();

              // Do we have a key for this account yet? if not, create it and set it to 0
              if (!balanceByAccount.hasOwnProperty(accountName)) {
                balanceByAccount[accountName] = 0;
              }

              // Add the amount to the account.
              balanceByAccount[accountName] += transaction.getAmount();
            }

            // Ensure we've pushed the last month in.
            if (formattedDate !== reportData.labels[reportData.labels.length - 1]) {
              reportData.labels.push(formattedDate);

              let totalAssets = 0;
              let totalLiabilities = 0;

              for (let account of Object.keys(balanceByAccount)) {
                if (balanceByAccount[account] > 0) {
                  totalAssets += balanceByAccount[account];
                } else {
                  totalLiabilities -= balanceByAccount[account];
                }
              }

              reportData.assets.push(totalAssets);
              reportData.liabilities.push(totalLiabilities);
              reportData.netWorths.push(totalAssets - totalLiabilities);
            }

            if (transactions.length > 0) {
              // Fill in any gaps in the months in case they're missing data.
              var currentIndex = 0;

              var currentDate = transactions[0].get('date').toNativeDate();
              var maxDate = transactions[transactions.length - 1].get('date').toNativeDate();

              // For debugging ----------------------------------------------------
              // var currentDate = new Date(transactions[0].date);
              // var maxDate = new Date(transactions[transactions.length - 1].date);
              // ------------------------------------------------------------------

              // Ensure we're on the 1st to avoid edge cases like the 31st.
              currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);

              var labels = reportData.labels;
              var assets = reportData.assets;
              var liabilities = reportData.liabilities;
              var netWorths = reportData.netWorths;

              while (currentDate < maxDate) {
                formattedDate = ynabToolKit.reports.formatDatel8n(currentDate);

                if (labels.indexOf(formattedDate) < 0) {
                  labels.splice(currentIndex + 1, 0, formattedDate);
                  assets.splice(currentIndex + 1, 0, assets[currentIndex]);
                  liabilities.splice(currentIndex + 1, 0, liabilities[currentIndex]);
                  netWorths.splice(currentIndex + 1, 0, netWorths[currentIndex]);
                }

                currentIndex++;
                currentDate.setMonth(currentDate.getMonth() + 1);
              }
            }

            resolve();
          });
        },

        createChart($reportsData) {
          $reportsData.css({
            display: 'inline-flex'
          }).html($(
              '<div id="report-chart" style="flex-grow: 1; position: relative; width: 100%"></div>'
          ));

          let startIndex = ynabToolKit.reports.allowedDateStart;
          let endIndex = ynabToolKit.reports.allowedDateEnd;

          // only show the data that's available in the filters we have set
          let reportLabels = reportData.labels.slice(startIndex, endIndex);
          let liabilities = reportData.liabilities.slice(startIndex, endIndex);
          let assets = reportData.assets.slice(startIndex, endIndex);
          let netWorths = reportData.netWorths.slice(startIndex, endIndex);

          let pointHover = {
            events: {
              mouseOver: function () {
                setHeaderValues(this.index);
              },
              mouseOut: function () {
                onMouseOut(this.index);
              }
            }
          };

          ynabToolKit.netWorthReport.chart = new Highcharts.Chart({
            credits: false,
            chart: {
              renderTo: 'report-chart'
            },
            legend: {
              enabled: false
            },
            title: {
              text: ''
            },
            xAxis: {
              categories: reportLabels
            },
            yAxis: {
              title: { text: '' },
              labels: {
                formatter: function () {
                  return ynabToolKit.shared.formatCurrency(this.value);
                }
              }
            },
            tooltip: {
              enabled: false
            },
            series: [
              {
                id: 'debts',
                type: 'column',
                name: (ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.debts']) || 'Debts',
                color: 'rgba(234,106,81,1)',
                data: liabilities,
                pointPadding: 0,
                point: pointHover
              }, {
                id: 'assets',
                type: 'column',
                name: (ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.assets']) || 'Assets',
                color: 'rgba(142,208,223,1)',
                data: assets,
                pointPadding: 0,
                point: pointHover
              }, {
                id: 'networth',
                type: 'area',
                name: (ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.netWorth']) || 'Net Worth',
                fillColor: 'rgba(244,248,226,0.5)',
                negativeFillColor: 'rgba(247, 220, 218, 0.5)',
                data: netWorths,
                point: pointHover
              }
            ]
          });

          setHeaderValues(reportLabels.length - 1);
        }
      };
    }());
  } else {
    setTimeout(poll, 250);
  }
}());
