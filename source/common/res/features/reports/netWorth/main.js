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

            var lastLabel = null;
            var balanceByAccount = {};
            var formattedDate = null;

            transactions.forEach(function (transaction) {
              formattedDate = ynabToolKit.reports.formatTransactionDatel8n(transaction);

              if (lastLabel === null) lastLabel = formattedDate;

              // If it's time to push the next month's data into the arrays let's
              // go for it.
              if (formattedDate !== lastLabel) {
                reportData.labels.push(lastLabel);

                var totalAssets = 0;
                var totalLiabilities = 0;

                for (var key in balanceByAccount) {
                  if (balanceByAccount.hasOwnProperty(key)) {
                    if (balanceByAccount[key] > 0) {
                      totalAssets += (balanceByAccount[key] || 0);
                    } else {
                      totalLiabilities += (-balanceByAccount[key] || 0);
                    }
                  }
                }

                reportData.assets.push(totalAssets);
                reportData.liabilities.push(totalLiabilities);
                reportData.netWorths.push(totalAssets - totalLiabilities);

                lastLabel = formattedDate;
              }

              // If we need a holder in balanceByAccount let's get one.
              if (!balanceByAccount.hasOwnProperty(transaction.getAccountName())) {
                balanceByAccount[transaction.getAccountName()] = 0;
              }

              // Tally ho.
              balanceByAccount[transaction.getAccountName()] += transaction.getAmount();
            });

            // Ensure we've pushed the last month in.
            if (formattedDate !== reportData.labels[reportData.labels.length - 1]) {
              reportData.labels.push(formattedDate);

              var totalAssets = 0;
              var totalLiabilities = 0;

              for (var key in balanceByAccount) {
                if (balanceByAccount.hasOwnProperty(key)) {
                  if (balanceByAccount[key] > 0) {
                    totalAssets += (balanceByAccount[key] || 0);
                  } else {
                    totalLiabilities += (-balanceByAccount[key] || 0);
                  }
                }
              }

              reportData.assets.push(totalAssets);
              reportData.liabilities.push(totalLiabilities);
              reportData.netWorths.push(totalAssets - totalLiabilities);
            }

            if (transactions.length > 0) {
              // Fill in any gaps in the months in case they're missing data.
              var currentIndex = 0;

              var currentDate = ynabToolKit.shared.toLocalDate(transactions[0].get('date'));
              var maxDate = ynabToolKit.shared.toLocalDate(transactions[transactions.length - 1].get('date'));

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
                formattedDate = ynab.YNABSharedLib.dateFormatter.formatDate(currentDate, 'MMM YYYY');
                var year = formattedDate.split(' ')[1];
                var month = formattedDate.split(' ')[0];
                month = (ynabToolKit.l10nData && ynabToolKit.l10nData['months.' + month]) || month;
                formattedDate = month + ' ' + year;

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

          // grab the current date filter from reports
          // let allowedDateFilter = ynabToolKit.reports.allowedDates;

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
