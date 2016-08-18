/* eslint-disable no-multi-str */

(function poll() {
  if (typeof ynabToolKit !== 'undefined' && ynabToolKit.actOnChangeInit === true) {
    let reportData = {
      labels: [],
      assets: [],
      liabilities: [],
      netWorths: []
    };

    ynabToolKit.netWorthReport = (function () {
      return {
        reportHeaders() {
          return '<div id="reports-inspector"> \
            <div class="reports-inspector-detail"> \
              <div class="reports-legend-square debts"></div> \
              <span class="reports-inspector-heading">' +
              ((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.debts']) || 'Debts') + '</span> \
              <span id="reports-inspector-debts" class="reports-inspector-value currency"></span> \
            </div> \
            <div class="reports-inspector-divider"></div> \
            <div class="reports-inspector-detail"> \
              <div class="reports-legend-square assets"></div> \
              <span class="reports-inspector-heading">' +
              ((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.assets']) || 'Assets') + '</span> \
              <span id="reports-inspector-assets" class="reports-inspector-value currency"></span> \
            </div> \
            <div class="reports-inspector-divider"></div> \
            <div class="reports-inspector-detail"> \
              <div class="reports-legend-line net-worth"></div> \
              <span class="reports-inspector-heading">' +
              ((ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.netWorth']) || 'Net Worth') + '</span> \
              <span id="reports-inspector-net-worth" class="reports-inspector-value currency"></span> \
            </div> \
          </div>';
        },

        calculate(transactions) {
          reportData.labels.length = 0;
          reportData.assets.length = 0;
          reportData.liabilities.length = 0;
          reportData.netWorths.length = 0;

          var lastLabel = null;
          var balanceByAccount = {};
          var date = null;
          var formattedDate = null;

          transactions.forEach(function (transaction) {
            date = ynabToolKit.shared.toLocalDate(transaction.get('date'));
            formattedDate = ynab.YNABSharedLib.dateFormatter.formatDate(date, 'MMM YYYY');
            var year = formattedDate.split(' ')[1];
            var month = formattedDate.split(' ')[0];
            month = (ynabToolKit.l10nData && ynabToolKit.l10nData['months.' + month]) || month;
            formattedDate = month + ' ' + year;

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
        },

        createChart($reportsPanel) {
          var dateFilter = document.getElementById('reports-date-filter');
          var labels = reportData.labels;
          var start = [labels[0], labels[labels.length - 1]];

          if (start[0] === start[1]) {
              // We only have one month. We can't show the filter.
            $('#reports-filter').hide();
          } else {
            // Restore the date filter values in case they've gone to another tab and come back.
            var savedStart = sessionStorage.getItem('reportsDateFilter');

            if (savedStart) {
              savedStart = savedStart.split(',');

              if (savedStart.length === 2 && savedStart[0].length > 0 && savedStart[1].length > 0) {
                start = savedStart;
              }
            }

            // Set up the date filter.
            noUiSlider.create(dateFilter, {
              connect: true,
              start,
              range: {
                min: 0,
                max: labels.length - 1
              },
              step: 1,
              tooltips: true,
              format: {
                to(index) {
                  return reportData.labels[Math.round(index)];
                },

                from(value) {
                  return reportData.labels.indexOf(value);
                }
              }
            });

            dateFilter.noUiSlider.on('slide', ynabToolKit.netWorthReport.updateReportWithDateFilter);
          }

          // Is the report fully positive? If so we should start the chart at 0.
          // If not, let the chart do its thing so that people can see their negative
          // net worths. liabilities and Assets are always positive, so this only
          // matters with the net worth data points.
          var startAtZero = true;
          reportData.netWorths.forEach(function (netWorth) {
            if (netWorth < 0) {
              startAtZero = false;
            }
          });

          // If there's only one month's worth of data, then the net worth
          // figure won't be visible, as there's only a dot. Let's set the
          // dot colour in that case.
          var netWorthDotColor = 'rgba(255,255,255,0)';

          if (labels.length === 1) {
            netWorthDotColor = 'rgba(102,147,176,1)';
          }

          var chartData = {
            labels,
            datasets: [
              {
                label: (ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.debts']) || 'Debts',
                backgroundColor: 'rgba(234,106,81,1)',
                data: reportData.liabilities
              }, {
                label: (ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.assets']) || 'Assets',
                backgroundColor: 'rgba(142,208,223,1)',
                data: reportData.assets
              }, {
                type: 'line',
                label: (ynabToolKit.l10nData && ynabToolKit.l10nData['toolkit.netWorth']) || 'Net Worth',
                fill: true,
                tension: 0,
                borderColor: 'rgba(102,147,176,1)',
                backgroundColor: 'rgba(244,248,226,0.3)',
                pointBorderColor: netWorthDotColor,
                pointBackgroundColor: netWorthDotColor,
                pointBorderWidth: 5,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: netWorthDotColor,
                pointHoverBorderColor: netWorthDotColor,
                pointHoverBorderWidth: 5,
                data: reportData.netWorths
              }
            ]
          };

          $reportsPanel.append('<canvas id="reportCanvas" width="100" height="100"></canvas>');
          let context = document.getElementById('reportCanvas').getContext('2d');
          ynabToolKit.reports.updateCanvasSize();
          ynabToolKit.netWorthReport.chart = new Chart(context, {
            type: 'bar',
            data: chartData,
            options: {
              responsive: false,
              responsiveAnimationDuration: 2500,
              maintainAspectRatio: false,
              legend: {
                display: false
              },
              hover: {
                onHover(points) {
                    // This is an array with 3 values in it if they're moused over an
                    // actual value. The point along the X axis is always the same
                    // for all 3 values for us, so just grab the first one then populate
                    // the inspector.
                  if (points.length > 0) {
                    var index = points[0]._index;

                      // Need to calculate the adjusted index for the date filter if it's applied.
                    if ($('#reports-filter').is(':visible')) {
                      var values = document.getElementById('reports-date-filter').noUiSlider.get();
                      index += reportData.labels.indexOf(values[0]);
                    }

                    var liabilities = reportData.liabilities[index];
                    var assets = reportData.assets[index];
                    var netWorth = reportData.netWorths[index];

                    $('#reports-inspector-debts').text(ynabToolKit.shared.formatCurrency(liabilities));
                    $('#reports-inspector-assets').text(ynabToolKit.shared.formatCurrency(assets));
                    $('#reports-inspector-net-worth').text(ynabToolKit.shared.formatCurrency(netWorth));
                  }
                }
              },
              tooltips: {
                enabled: false
              },
              scales: {
                xAxes: [
                  {
                    gridLines: {
                      display: false
                    },
                    labels: {
                      show: true,
                      fontFamily: "'Lato',Arial,'Helvetica Neue',Helvetica,sans-serif"
                    }
                  }
                ],
                yAxes: [
                  {
                    ticks: {
                      beginAtZero: startAtZero,

                        // This formats the currency on the Y axis (to the left of the chart)
                      callback(value) { return ynabToolKit.shared.formatCurrency(value); }
                    }
                  }
                ]
              }
            }
          });

          ynabToolKit.netWorthReport.updateReportWithDateFilter();
        },

        updateReportWithDateFilter() {
          var labels = reportData.labels;
          var liabilities = reportData.liabilities;
          var assets = reportData.assets;
          var netWorths = reportData.netWorths;
          var chart = ynabToolKit.netWorthReport.chart;
          var values = [labels[0], labels[0]];

          if ($('#reports-filter').is(':visible')) {
            // Ok, the filter is in use, set the values to the filter values.
            values = document.getElementById('reports-date-filter').noUiSlider.get();
          }

          var startIndex = labels.indexOf(values[0]);
          var endIndex = labels.indexOf(values[1]);

            // Save the date filter values in case they go to another tab and come back.
          sessionStorage.setItem('reportsDateFilter', values);

          chart.data.labels = labels.slice(startIndex, endIndex + 1);
          chart.data.datasets[0].data = liabilities.slice(startIndex, endIndex + 1);
          chart.data.datasets[1].data = assets.slice(startIndex, endIndex + 1);
          chart.data.datasets[2].data = netWorths.slice(startIndex, endIndex + 1);

          chart.update();

            // Set the inspector values to the latest date in the date range.
          $('#reports-inspector-debts').text(ynabToolKit.shared.formatCurrency(liabilities[endIndex]));
          $('#reports-inspector-assets').text(ynabToolKit.shared.formatCurrency(assets[endIndex]));
          $('#reports-inspector-net-worth').text(ynabToolKit.shared.formatCurrency(netWorths[endIndex]));
        }
      };
    }());
  } else {
    setTimeout(poll, 250);
  }
}());
